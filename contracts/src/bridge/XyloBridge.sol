// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import "../interfaces/IERC20.sol";

/**
 * @title ITokenMessengerV2
 * @notice Interface for Circle CCTP V2 TokenMessenger contract
 * @dev Arc Testnet uses TokenMessengerV2 at 0x8FE6B999Dc680CcFDD5Bf7EB0974218be2542DAA
 */
interface ITokenMessengerV2 {
    /**
     * @notice Deposits and burns tokens for a cross-chain transfer
     * @param amount Amount of tokens to burn
     * @param destinationDomain CCTP domain ID of destination chain
     * @param mintRecipient Address on destination chain to receive tokens (as bytes32)
     * @param burnToken Address of token to burn on source chain
     * @param destinationCaller Address allowed to call receiveMessage on destination (bytes32(0) for any)
     * @param maxFee Maximum fee willing to pay on destination chain (0 for standard transfer)
     * @param minFinalityThreshold Minimum finality threshold (1000 for fast, 2000 for standard)
     * @return nonce Unique nonce for this message
     */
    function depositForBurn(
        uint256 amount,
        uint32 destinationDomain,
        bytes32 mintRecipient,
        address burnToken,
        bytes32 destinationCaller,
        uint256 maxFee,
        uint32 minFinalityThreshold
    ) external returns (bytes32 nonce);

    /**
     * @notice Simplified depositForBurn with default parameters
     * @dev Uses bytes32(0) for destinationCaller, 0 for maxFee, 2000 for minFinalityThreshold
     */
    function depositForBurn(
        uint256 amount,
        uint32 destinationDomain,
        bytes32 mintRecipient,
        address burnToken
    ) external returns (bytes32 nonce);
}

/**
 * @title IMessageTransmitterV2
 * @notice Interface for Circle CCTP V2 MessageTransmitter contract
 * @dev Arc Testnet uses MessageTransmitterV2 at 0xE737e5cEBEEBa77EFE34D4aa090756590b1CE275
 */
interface IMessageTransmitterV2 {
    function receiveMessage(
        bytes calldata message, 
        bytes calldata attestation
    ) external returns (bool success);
    
    function usedNonces(bytes32 nonce) external view returns (uint256);
}

/**
 * @title XyloBridge
 * @notice Cross-chain bridge powered by Circle CCTP for native USDC transfers
 * @dev Enables seamless USDC bridging between Arc and other CCTP-supported chains
 */
contract XyloBridge {
    // CCTP contracts on Arc Testnet
    address public immutable tokenMessenger;
    address public immutable messageTransmitter;
    
    // USDC address on Arc
    address public immutable usdc;

    // Owner for admin functions
    address public owner;

    // Domain IDs for supported chains
    uint32 public constant ARC_DOMAIN = 26;
    
    // Mapping of chain names to domain IDs
    mapping(string => uint32) public chainDomains;
    
    // Supported destination domains
    mapping(uint32 => bool) public supportedDomains;

    // Bridge statistics
    uint256 public totalBridgedIn;
    uint256 public totalBridgedOut;
    uint256 public bridgeCount;

    // Events
    event BridgeInitiated(
        address indexed sender,
        uint32 indexed destinationDomain,
        address indexed recipient,
        uint256 amount,
        bytes32 nonce
    );
    event BridgeCompleted(
        address indexed recipient,
        uint256 amount,
        bytes32 messageHash
    );
    event DomainAdded(string chainName, uint32 domainId);
    event DomainRemoved(uint32 domainId);

    modifier onlyOwner() {
        require(msg.sender == owner, "XyloBridge: FORBIDDEN");
        _;
    }

    constructor(
        address _tokenMessenger,
        address _messageTransmitter,
        address _usdc
    ) {
        tokenMessenger = _tokenMessenger;
        messageTransmitter = _messageTransmitter;
        usdc = _usdc;
        owner = msg.sender;

        // Initialize supported domains
        _initializeDomains();
    }

    function _initializeDomains() internal {
        // Ethereum Mainnet/Sepolia
        chainDomains["ethereum"] = 0;
        supportedDomains[0] = true;

        // Avalanche
        chainDomains["avalanche"] = 1;
        supportedDomains[1] = true;

        // Optimism
        chainDomains["optimism"] = 2;
        supportedDomains[2] = true;

        // Arbitrum
        chainDomains["arbitrum"] = 3;
        supportedDomains[3] = true;

        // Solana (different format but included for reference)
        chainDomains["solana"] = 5;
        supportedDomains[5] = true;

        // Base
        chainDomains["base"] = 6;
        supportedDomains[6] = true;

        // Polygon
        chainDomains["polygon"] = 7;
        supportedDomains[7] = true;

        // Unichain
        chainDomains["unichain"] = 10;
        supportedDomains[10] = true;

        // Linea
        chainDomains["linea"] = 11;
        supportedDomains[11] = true;

        // Codex
        chainDomains["codex"] = 12;
        supportedDomains[12] = true;

        // Sonic
        chainDomains["sonic"] = 13;
        supportedDomains[13] = true;

        // World Chain
        chainDomains["worldchain"] = 14;
        supportedDomains[14] = true;

        // Monad
        chainDomains["monad"] = 15;
        supportedDomains[15] = true;

        // Sei
        chainDomains["sei"] = 16;
        supportedDomains[16] = true;

        // BNB Smart Chain
        chainDomains["bnb"] = 17;
        supportedDomains[17] = true;

        // XDC
        chainDomains["xdc"] = 18;
        supportedDomains[18] = true;

        // HyperEVM
        chainDomains["hyperevm"] = 19;
        supportedDomains[19] = true;

        // Ink
        chainDomains["ink"] = 21;
        supportedDomains[21] = true;

        // Plume
        chainDomains["plume"] = 22;
        supportedDomains[22] = true;

        // Starknet
        chainDomains["starknet"] = 25;
        supportedDomains[25] = true;

        // Note: Arc is domain 26 — not added as destination (self)

        // Stellar
        chainDomains["stellar"] = 27;
        supportedDomains[27] = true;

        // EDGE
        chainDomains["edge"] = 28;
        supportedDomains[28] = true;

        // Injective
        chainDomains["injective"] = 29;
        supportedDomains[29] = true;

        // Morph
        chainDomains["morph"] = 30;
        supportedDomains[30] = true;

        // Pharos
        chainDomains["pharos"] = 31;
        supportedDomains[31] = true;
    }

    // ============ Bridge Out Functions ============

    /**
     * @notice Bridge USDC from Arc to another chain using CCTP V2
     * @param amount Amount of USDC to bridge (in 6 decimals)
     * @param destinationDomain CCTP domain ID of destination chain
     * @param recipient Recipient address on destination chain (as bytes32)
     * @return nonce Unique message nonce from CCTP
     */
    function bridgeOut(
        uint256 amount,
        uint32 destinationDomain,
        bytes32 recipient
    ) external returns (bytes32 nonce) {
        require(amount > 0, "XyloBridge: ZERO_AMOUNT");
        require(supportedDomains[destinationDomain], "XyloBridge: UNSUPPORTED_DOMAIN");
        require(recipient != bytes32(0), "XyloBridge: INVALID_RECIPIENT");

        // Transfer USDC from sender to this contract
        IERC20(usdc).transferFrom(msg.sender, address(this), amount);

        // Approve TokenMessengerV2 to burn USDC
        IERC20(usdc).approve(tokenMessenger, amount);

        // Initiate CCTP V2 burn with standard transfer (minFinalityThreshold = 2000)
        // destinationCaller = bytes32(0) allows anyone to call receiveMessage
        // maxFee = 0 for standard transfer (no relayer fee)
        nonce = ITokenMessengerV2(tokenMessenger).depositForBurn(
            amount,
            destinationDomain,
            recipient,
            usdc,
            bytes32(0),  // destinationCaller - anyone can relay
            0,           // maxFee - standard transfer, no fee
            2000         // minFinalityThreshold - standard finality
        );

        // Update statistics
        totalBridgedOut += amount;
        bridgeCount++;

        emit BridgeInitiated(msg.sender, destinationDomain, address(uint160(uint256(recipient))), amount, nonce);
    }

    /**
     * @notice Bridge USDC to a specific chain by name
     * @param amount Amount of USDC to bridge (in 6 decimals)
     * @param chainName Name of destination chain (e.g., "ethereum", "base")
     * @param recipient Recipient address on destination chain
     * @return nonce Unique message nonce from CCTP
     */
    function bridgeToChain(
        uint256 amount,
        string calldata chainName,
        address recipient
    ) external returns (bytes32 nonce) {
        uint32 destinationDomain = chainDomains[chainName];
        require(destinationDomain != 0 || keccak256(bytes(chainName)) == keccak256(bytes("ethereum")), 
            "XyloBridge: UNKNOWN_CHAIN");
        
        bytes32 recipientBytes32 = bytes32(uint256(uint160(recipient)));
        
        return this.bridgeOut(amount, destinationDomain, recipientBytes32);
    }

    // ============ Bridge In Functions ============

    /**
     * @notice Complete a bridge transfer by submitting CCTP V2 attestation
     * @param message The CCTP message from source chain
     * @param attestation The attestation from Circle's attestation service
     */
    function bridgeIn(
        bytes calldata message,
        bytes calldata attestation
    ) external returns (bool success) {
        // Receive the message and mint USDC via MessageTransmitterV2
        success = IMessageTransmitterV2(messageTransmitter).receiveMessage(message, attestation);
        require(success, "XyloBridge: RECEIVE_FAILED");

        // Note: USDC is minted directly to the recipient specified in the message
        // We just emit an event for tracking
        
        totalBridgedIn += _extractAmount(message);
        
        emit BridgeCompleted(msg.sender, _extractAmount(message), keccak256(message));
    }

    // ============ View Functions ============

    /**
     * @notice Get the domain ID for a chain name
     */
    function getDomainId(string calldata chainName) external view returns (uint32) {
        return chainDomains[chainName];
    }

    /**
     * @notice Check if a domain is supported
     */
    function isDomainSupported(uint32 domainId) external view returns (bool) {
        return supportedDomains[domainId];
    }

    /**
     * @notice Get bridge statistics
     */
    function getStats() external view returns (
        uint256 _totalBridgedIn,
        uint256 _totalBridgedOut,
        uint256 _bridgeCount
    ) {
        return (totalBridgedIn, totalBridgedOut, bridgeCount);
    }

    /**
     * @notice Convert address to bytes32 for CCTP
     */
    function addressToBytes32(address addr) external pure returns (bytes32) {
        return bytes32(uint256(uint160(addr)));
    }

    /**
     * @notice Convert bytes32 to address
     */
    function bytes32ToAddress(bytes32 b) external pure returns (address) {
        return address(uint160(uint256(b)));
    }

    // ============ Admin Functions ============

    function addDomain(string calldata chainName, uint32 domainId) external onlyOwner {
        chainDomains[chainName] = domainId;
        supportedDomains[domainId] = true;
        emit DomainAdded(chainName, domainId);
    }

    function removeDomain(uint32 domainId) external onlyOwner {
        supportedDomains[domainId] = false;
        emit DomainRemoved(domainId);
    }

    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "XyloBridge: ZERO_ADDRESS");
        owner = newOwner;
    }

    /**
     * @notice Rescue tokens accidentally sent to this contract
     */
    function rescueTokens(address token, address to, uint256 amount) external onlyOwner {
        IERC20(token).transfer(to, amount);
    }

    // ============ Internal Functions ============

    function _extractAmount(bytes calldata message) internal pure returns (uint256) {
        // CCTP message format has amount at a specific offset
        // This is a simplified extraction - in production, use proper parsing
        if (message.length < 100) return 0;
        
        // Amount is typically at offset 68-100 in CCTP messages (32 bytes)
        bytes32 amountBytes;
        assembly {
            amountBytes := calldataload(add(message.offset, 68))
        }
        return uint256(amountBytes);
    }
}
