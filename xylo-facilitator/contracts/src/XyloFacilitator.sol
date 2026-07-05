// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title XyloFacilitator
 * @notice Hosted x402 facilitator-as-a-service on Arc
 * @dev Settles EIP-3009 gasless USDC payments with sub-second finality on Arc
 *
 * Key features:
 * - Receives EIP-3009 signed transfers from AI agents
 * - Validates signatures on-chain
 * - Settles USDC payments with configurable fee
 * - Tracks all settlements for analytics
 */
contract XyloFacilitator is Ownable, ReentrancyGuard {

    // ============ State Variables ============

    /// @notice USDC token address on Arc
    address public immutable usdc;

    /// @notice Fee in basis points (100 = 1%)
    uint256 public feeBps;

    /// @notice Treasury address that receives fees
    address public treasury;

    /// @notice Total USDC settled through this facilitator
    uint256 public totalSettled;

    /// @notice Total number of settlements
    uint256 public totalTransactions;

    /// @notice Whether a transaction hash has been settled
    mapping(bytes32 => bool) public settledTxHashes;

    /// @notice Settlement details by tx hash
    mapping(bytes32 => Settlement) public settlements;

    /// @notice Authorized settler addresses
    mapping(address => bool) public settlers;

    /// @notice Developer route -> recipient address
    mapping(bytes32 => address) public routeRecipients;

    // ============ Structs ============

    struct Settlement {
        address from;
        address to;
        uint256 amount;
        uint256 fee;
        uint256 timestamp;
        bool settled;
    }

    // ============ Events ============

    event PaymentSettled(
        bytes32 indexed txHash,
        address indexed from,
        address indexed to,
        uint256 amount,
        uint256 fee,
        uint256 timestamp
    );

    event FeeUpdated(uint256 oldFeeBps, uint256 newFeeBps);
    event TreasuryUpdated(address oldTreasury, address newTreasury);
    event SettlerUpdated(address indexed settler, bool authorized);
    event RouteRegistered(bytes32 indexed routeId, address recipient);

    // ============ Modifiers ============

    modifier onlySettler() {
        require(settlers[msg.sender] || msg.sender == owner(), "Not authorized settler");
        _;
    }

    // ============ Constructor ============

    constructor(
        address _usdc,
        address _treasury,
        uint256 _feeBps
    ) Ownable(msg.sender) {
        require(_usdc != address(0), "Invalid USDC address");
        require(_treasury != address(0), "Invalid treasury");
        require(_feeBps <= 1000, "Fee too high"); // Max 10%

        usdc = _usdc;
        treasury = _treasury;
        feeBps = _feeBps;

        settlers[msg.sender] = true;
        emit SettlerUpdated(msg.sender, true);
    }

    // ============ External Functions ============

    /**
     * @notice Settle an EIP-3009 gasless USDC payment
     * @dev Called by authorized settlers after verifying the signature off-chain
     * @param from Payer address
     * @param to Payee address
     * @param value Amount in USDC (6 decimals)
     * @param validAfter Timestamp after which the authorization is valid
     * @param validBefore Timestamp before which the authorization is valid
     * @param nonce Unique nonce for this authorization
     * @param v Recovery byte of the signature
     * @param r First 32 bytes of the signature
     * @param s Second 32 bytes of the signature
     */
    function settlePayment(
        address from,
        address to,
        uint256 value,
        uint256 validAfter,
        uint256 validBefore,
        bytes32 nonce,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external onlySettler nonReentrant returns (bool) {
        // Check validBefore hasn't passed
        require(block.timestamp < validBefore, "Authorization expired");

        // Compute the tx hash for tracking
        bytes32 txHash = keccak256(abi.encodePacked(
            from, to, value, validAfter, validBefore, nonce
        ));

        // Check not already settled
        require(!settledTxHashes[txHash], "Already settled");

        // Calculate fee
        uint256 fee = (value * feeBps) / 10000;
        uint256 netAmount = value - fee;

        // Execute the EIP-3009 transfer: from -> this contract (facilitator)
        // This allows us to split the payment correctly
        (bool success, ) = usdc.call(
            abi.encodeWithSignature(
                "transferWithAuthorization(address,address,uint256,uint256,uint256,bytes32,uint8,bytes32,bytes32)",
                from, address(this), value, validAfter, validBefore, nonce, v, r, s
            )
        );

        if (!success) {
            revert("EIP-3009 transfer failed");
        }

        // Distribute: net amount to recipient
        (bool toSuccess, ) = usdc.call(
            abi.encodeWithSignature(
                "transfer(address,uint256)",
                to, netAmount
            )
        );
        require(toSuccess, "Transfer to recipient failed");

        // Transfer fee to treasury
        if (fee > 0) {
            (bool feeSuccess, ) = usdc.call(
                abi.encodeWithSignature(
                    "transfer(address,uint256)",
                    treasury, fee
                )
            );
            require(feeSuccess, "Fee transfer failed");
        }

        // Record settlement
        settledTxHashes[txHash] = true;
        settlements[txHash] = Settlement({
            from: from,
            to: to,
            amount: value,
            fee: fee,
            timestamp: block.timestamp,
            settled: true
        });

        totalSettled += value;
        totalTransactions++;

        emit PaymentSettled(txHash, from, to, value, fee, block.timestamp);

        return true;
    }

    /**
     * @notice Direct settlement for Circle developer-controlled wallets
     * @dev Settles a USDC payment directly (not via EIP-3009)
     * @param from Payer address
     * @param to Payee address
     * @param value Amount in USDC (6 decimals)
     */
    function settleDirect(
        address from,
        address to,
        uint256 value
    ) external onlySettler nonReentrant returns (bool) {
        bytes32 txHash = keccak256(abi.encodePacked(
            from, to, value, block.timestamp, totalTransactions
        ));

        require(!settledTxHashes[txHash], "Already settled");

        uint256 fee = (value * feeBps) / 10000;
        uint256 recipientAmount = value - fee;

        // Transfer USDC from payer to recipient
        (bool success, ) = usdc.call(
            abi.encodeWithSignature(
                "transferFrom(address,address,uint256)",
                from, to, recipientAmount
            )
        );

        require(success, "Transfer failed");

        // Transfer fee to treasury
        if (fee > 0) {
            (bool feeSuccess, ) = usdc.call(
                abi.encodeWithSignature(
                    "transferFrom(address,address,uint256)",
                    from, treasury, fee
                )
            );
            require(feeSuccess, "Fee transfer failed");
        }

        settledTxHashes[txHash] = true;
        settlements[txHash] = Settlement({
            from: from,
            to: to,
            amount: value,
            fee: fee,
            timestamp: block.timestamp,
            settled: true
        });

        totalSettled += value;
        totalTransactions++;

        emit PaymentSettled(txHash, from, to, value, fee, block.timestamp);

        return true;
    }

    /**
     * @notice Get settlement status
     * @param txHash The transaction hash
     */
    function getSettlementStatus(bytes32 txHash) external view returns (
        bool settled,
        address from,
        address to,
        uint256 amount,
        uint256 fee,
        uint256 timestamp
    ) {
        Settlement memory s = settlements[txHash];
        return (s.settled, s.from, s.to, s.amount, s.fee, s.timestamp);
    }

    /**
     * @notice Register a developer API route recipient
     * @param routeId Hash of the route identifier
     * @param recipient Address that receives payments for this route
     */
    function registerRoute(bytes32 routeId, address recipient) external onlyOwner {
        require(recipient != address(0), "Invalid recipient");
        routeRecipients[routeId] = recipient;
        emit RouteRegistered(routeId, recipient);
    }

    // ============ Admin Functions ============

    function setFeeBps(uint256 _feeBps) external onlyOwner {
        require(_feeBps <= 1000, "Fee too high");
        uint256 oldFee = feeBps;
        feeBps = _feeBps;
        emit FeeUpdated(oldFee, _feeBps);
    }

    function setTreasury(address _treasury) external onlyOwner {
        require(_treasury != address(0), "Invalid treasury");
        address oldTreasury = treasury;
        treasury = _treasury;
        emit TreasuryUpdated(oldTreasury, _treasury);
    }

    function setSettler(address settler, bool authorized) external onlyOwner {
        settlers[settler] = authorized;
        emit SettlerUpdated(settler, authorized);
    }
}
