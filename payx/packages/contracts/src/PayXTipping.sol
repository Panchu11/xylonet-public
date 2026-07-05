// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";

/**
 * @title PayX Tipping Contract
 * @notice Enables tipping X/Twitter users with USDC on Arc Network
 * @dev Tips are escrowed until the X handle owner claims them via OAuth verification
 */
contract PayXTipping is ReentrancyGuard, Ownable {
    using SafeERC20 for IERC20;
    using ECDSA for bytes32;
    using MessageHashUtils for bytes32;

    // ═══════════════════════════════════════════════════════════════════════
    // STRUCTS
    // ═══════════════════════════════════════════════════════════════════════

    struct Tip {
        address tipper;
        uint256 amount;
        uint256 timestamp;
        string message;
    }

    struct HandleInfo {
        uint256 pendingBalance;
        address linkedWallet;
        bool isRegistered;
        uint256 totalReceived;
        uint256 totalClaimed;
        uint256 tipCount;
    }

    // ═══════════════════════════════════════════════════════════════════════
    // STATE VARIABLES
    // ═══════════════════════════════════════════════════════════════════════

    /// @notice USDC token contract (native on Arc)
    IERC20 public immutable usdc;

    /// @notice Oracle address that signs claim authorizations
    address public oracleSigner;

    /// @notice Platform fee in basis points (100 = 1%)
    uint256 public platformFeeBps;

    /// @notice Minimum tip amount
    uint256 public minTipAmount;

    /// @notice Platform fee recipient
    address public feeRecipient;

    /// @notice Total platform fees collected
    uint256 public totalFeesCollected;

    /// @notice X Handle (lowercase) => HandleInfo
    mapping(string => HandleInfo) public handles;

    /// @notice X Handle => Array of tips
    mapping(string => Tip[]) public tipHistory;

    /// @notice Used nonces for replay protection
    mapping(bytes32 => bool) public usedNonces;

    /// @notice Tipper address => total amount tipped
    mapping(address => uint256) public tipperTotalSent;

    // ═══════════════════════════════════════════════════════════════════════
    // EVENTS
    // ═══════════════════════════════════════════════════════════════════════

    event TipSent(
        string indexed handleHash,
        string handle,
        address indexed tipper,
        uint256 amount,
        uint256 fee,
        string message,
        uint256 timestamp
    );

    event TipsClaimed(
        string indexed handleHash,
        string handle,
        address indexed wallet,
        uint256 amount,
        uint256 timestamp
    );

    event WalletLinked(
        string indexed handleHash,
        string handle,
        address indexed wallet
    );

    event OracleSignerUpdated(address indexed oldSigner, address indexed newSigner);
    event PlatformFeeUpdated(uint256 oldFee, uint256 newFee);
    event MinTipAmountUpdated(uint256 oldAmount, uint256 newAmount);
    event FeeRecipientUpdated(address indexed oldRecipient, address indexed newRecipient);
    event FeesWithdrawn(address indexed recipient, uint256 amount);

    // ═══════════════════════════════════════════════════════════════════════
    // ERRORS
    // ═══════════════════════════════════════════════════════════════════════

    error InvalidHandle();
    error InvalidAmount();
    error InvalidSignature();
    error NonceAlreadyUsed();
    error NoTipsToClaim();
    error WalletMismatch();
    error ZeroAddress();
    error FeeTooHigh();

    // ═══════════════════════════════════════════════════════════════════════
    // CONSTRUCTOR
    // ═══════════════════════════════════════════════════════════════════════

    /**
     * @notice Initialize the PayX tipping contract
     * @param _usdc USDC token address on Arc
     * @param _oracleSigner Address that signs claim authorizations
     * @param _feeRecipient Address to receive platform fees
     * @param _platformFeeBps Platform fee in basis points (max 500 = 5%)
     * @param _minTipAmount Minimum tip amount in USDC (18 decimals)
     */
    constructor(
        address _usdc,
        address _oracleSigner,
        address _feeRecipient,
        uint256 _platformFeeBps,
        uint256 _minTipAmount
    ) Ownable(msg.sender) {
        if (_usdc == address(0)) revert ZeroAddress();
        if (_oracleSigner == address(0)) revert ZeroAddress();
        if (_feeRecipient == address(0)) revert ZeroAddress();
        if (_platformFeeBps > 500) revert FeeTooHigh(); // Max 5%

        usdc = IERC20(_usdc);
        oracleSigner = _oracleSigner;
        feeRecipient = _feeRecipient;
        platformFeeBps = _platformFeeBps;
        minTipAmount = _minTipAmount;
    }

    // ═══════════════════════════════════════════════════════════════════════
    // CORE FUNCTIONS
    // ═══════════════════════════════════════════════════════════════════════

    /**
     * @notice Send a tip to an X handle
     * @param handle The X/Twitter handle (without @, will be lowercased)
     * @param amount Amount of USDC to tip (18 decimals)
     * @param message Optional message with the tip (max 280 chars)
     */
    function tip(
        string calldata handle,
        uint256 amount,
        string calldata message
    ) external nonReentrant {
        // Validate inputs
        string memory normalizedHandle = _normalizeHandle(handle);
        if (bytes(normalizedHandle).length == 0) revert InvalidHandle();
        if (amount < minTipAmount) revert InvalidAmount();

        // Calculate fee
        uint256 fee = (amount * platformFeeBps) / 10000;
        uint256 netAmount = amount - fee;

        // Transfer USDC from tipper to this contract
        usdc.safeTransferFrom(msg.sender, address(this), amount);

        // Update state
        HandleInfo storage info = handles[normalizedHandle];
        info.pendingBalance += netAmount;
        info.totalReceived += netAmount;
        info.tipCount += 1;

        // Track fees
        totalFeesCollected += fee;

        // Track tipper stats
        tipperTotalSent[msg.sender] += amount;

        // Record tip history
        tipHistory[normalizedHandle].push(Tip({
            tipper: msg.sender,
            amount: netAmount,
            timestamp: block.timestamp,
            message: message
        }));

        emit TipSent(
            normalizedHandle,
            normalizedHandle,
            msg.sender,
            netAmount,
            fee,
            message,
            block.timestamp
        );
    }

    /**
     * @notice Claim all pending tips (requires backend signature)
     * @param handle The X handle being claimed
     * @param wallet The wallet to receive tips
     * @param nonce Unique nonce for replay protection
     * @param signature Backend signature proving X OAuth verification
     */
    function claimTips(
        string calldata handle,
        address wallet,
        bytes32 nonce,
        bytes calldata signature
    ) external nonReentrant {
        // Normalize handle
        string memory normalizedHandle = _normalizeHandle(handle);
        if (bytes(normalizedHandle).length == 0) revert InvalidHandle();
        if (wallet == address(0)) revert ZeroAddress();

        // Check nonce hasn't been used
        if (usedNonces[nonce]) revert NonceAlreadyUsed();
        usedNonces[nonce] = true;

        // Verify signature
        bytes32 messageHash = keccak256(abi.encodePacked(normalizedHandle, wallet, nonce));
        bytes32 ethSignedHash = messageHash.toEthSignedMessageHash();
        address recoveredSigner = ethSignedHash.recover(signature);
        if (recoveredSigner != oracleSigner) revert InvalidSignature();

        // Get handle info
        HandleInfo storage info = handles[normalizedHandle];
        uint256 amount = info.pendingBalance;
        if (amount == 0) revert NoTipsToClaim();

        // Link wallet on first claim
        if (!info.isRegistered) {
            info.linkedWallet = wallet;
            info.isRegistered = true;
            emit WalletLinked(normalizedHandle, normalizedHandle, wallet);
        } else {
            // Subsequent claims must use same wallet (or update via separate function)
            if (info.linkedWallet != wallet) revert WalletMismatch();
        }

        // Update state
        info.pendingBalance = 0;
        info.totalClaimed += amount;

        // Transfer USDC to creator's wallet
        usdc.safeTransfer(wallet, amount);

        emit TipsClaimed(normalizedHandle, normalizedHandle, wallet, amount, block.timestamp);
    }

    // ═══════════════════════════════════════════════════════════════════════
    // VIEW FUNCTIONS
    // ═══════════════════════════════════════════════════════════════════════

    /**
     * @notice Get pending balance for a handle
     * @param handle The X handle to check
     * @return Pending USDC balance
     */
    function getPendingBalance(string calldata handle) external view returns (uint256) {
        return handles[_normalizeHandle(handle)].pendingBalance;
    }

    /**
     * @notice Get handle information
     * @param handle The X handle to check
     * @return info HandleInfo struct
     */
    function getHandleInfo(string calldata handle) external view returns (HandleInfo memory) {
        return handles[_normalizeHandle(handle)];
    }

    /**
     * @notice Get tip count for a handle
     * @param handle The X handle to check
     * @return Number of tips received
     */
    function getTipCount(string calldata handle) external view returns (uint256) {
        return handles[_normalizeHandle(handle)].tipCount;
    }

    /**
     * @notice Get tip history for a handle
     * @param handle The X handle
     * @param offset Starting index
     * @param limit Max number of tips to return
     * @return tips Array of Tip structs
     */
    function getTipHistory(
        string calldata handle,
        uint256 offset,
        uint256 limit
    ) external view returns (Tip[] memory tips) {
        string memory normalizedHandle = _normalizeHandle(handle);
        Tip[] storage allTips = tipHistory[normalizedHandle];
        
        if (offset >= allTips.length) {
            return new Tip[](0);
        }

        uint256 end = offset + limit;
        if (end > allTips.length) {
            end = allTips.length;
        }

        tips = new Tip[](end - offset);
        for (uint256 i = offset; i < end; i++) {
            tips[i - offset] = allTips[i];
        }
    }

    /**
     * @notice Get linked wallet for a handle
     * @param handle The X handle
     * @return Linked wallet address (zero if not registered)
     */
    function getLinkedWallet(string calldata handle) external view returns (address) {
        return handles[_normalizeHandle(handle)].linkedWallet;
    }

    /**
     * @notice Check if a handle is registered
     * @param handle The X handle
     * @return True if handle has claimed before
     */
    function isHandleRegistered(string calldata handle) external view returns (bool) {
        return handles[_normalizeHandle(handle)].isRegistered;
    }

    // ═══════════════════════════════════════════════════════════════════════
    // ADMIN FUNCTIONS
    // ═══════════════════════════════════════════════════════════════════════

    /**
     * @notice Update oracle signer address
     * @param _newSigner New oracle signer address
     */
    function setOracleSigner(address _newSigner) external onlyOwner {
        if (_newSigner == address(0)) revert ZeroAddress();
        address oldSigner = oracleSigner;
        oracleSigner = _newSigner;
        emit OracleSignerUpdated(oldSigner, _newSigner);
    }

    /**
     * @notice Update platform fee
     * @param _newFeeBps New fee in basis points (max 500)
     */
    function setPlatformFee(uint256 _newFeeBps) external onlyOwner {
        if (_newFeeBps > 500) revert FeeTooHigh();
        uint256 oldFee = platformFeeBps;
        platformFeeBps = _newFeeBps;
        emit PlatformFeeUpdated(oldFee, _newFeeBps);
    }

    /**
     * @notice Update minimum tip amount
     * @param _newMinAmount New minimum tip amount
     */
    function setMinTipAmount(uint256 _newMinAmount) external onlyOwner {
        uint256 oldAmount = minTipAmount;
        minTipAmount = _newMinAmount;
        emit MinTipAmountUpdated(oldAmount, _newMinAmount);
    }

    /**
     * @notice Update fee recipient
     * @param _newRecipient New fee recipient address
     */
    function setFeeRecipient(address _newRecipient) external onlyOwner {
        if (_newRecipient == address(0)) revert ZeroAddress();
        address oldRecipient = feeRecipient;
        feeRecipient = _newRecipient;
        emit FeeRecipientUpdated(oldRecipient, _newRecipient);
    }

    /**
     * @notice Withdraw collected platform fees
     */
    function withdrawFees() external {
        uint256 amount = totalFeesCollected;
        totalFeesCollected = 0;
        usdc.safeTransfer(feeRecipient, amount);
        emit FeesWithdrawn(feeRecipient, amount);
    }

    // ═══════════════════════════════════════════════════════════════════════
    // INTERNAL FUNCTIONS
    // ═══════════════════════════════════════════════════════════════════════

    /**
     * @notice Normalize X handle to lowercase
     * @param handle The handle to normalize
     * @return Lowercase handle
     */
    function _normalizeHandle(string memory handle) internal pure returns (string memory) {
        bytes memory b = bytes(handle);
        if (b.length == 0 || b.length > 15) return "";
        
        bytes memory result = new bytes(b.length);
        for (uint256 i = 0; i < b.length; i++) {
            bytes1 char = b[i];
            // Convert uppercase to lowercase
            if (char >= 0x41 && char <= 0x5A) {
                result[i] = bytes1(uint8(char) + 32);
            } else if (
                (char >= 0x61 && char <= 0x7A) || // a-z
                (char >= 0x30 && char <= 0x39) || // 0-9
                char == 0x5F // underscore
            ) {
                result[i] = char;
            } else {
                return ""; // Invalid character
            }
        }
        return string(result);
    }
}
