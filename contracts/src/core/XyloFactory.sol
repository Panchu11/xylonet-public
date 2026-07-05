// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import "./XyloStablePool.sol";
import "../interfaces/IXyloFactory.sol";

/**
 * @title XyloFactory
 * @notice Factory contract for deploying XyloNet StableSwap pools
 * @dev Manages pool creation and protocol fee configuration
 */
contract XyloFactory is IXyloFactory {
    // Owner address
    address public owner;
    address public pendingOwner;

    // Fee configuration
    address public override feeRecipient;
    uint256 public override swapFee = 4; // 0.04% default
    uint256 public override protocolFee = 50; // 50% of swap fee goes to protocol

    // Pool registry
    mapping(address => mapping(address => address)) private pools;
    address[] private _allPools;

    // Default amplification parameter for stable pairs
    uint256 public defaultA = 200;

    // Events
    event OwnershipTransferStarted(address indexed previousOwner, address indexed newOwner);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    event DefaultAUpdated(uint256 oldA, uint256 newA);

    modifier onlyOwner() {
        require(msg.sender == owner, "XyloFactory: FORBIDDEN");
        _;
    }

    constructor(address _feeRecipient) {
        owner = msg.sender;
        feeRecipient = _feeRecipient;
    }

    // ============ View Functions ============

    function getPool(address tokenA, address tokenB) external view override returns (address pool) {
        (address token0, address token1) = _sortTokens(tokenA, tokenB);
        pool = pools[token0][token1];
    }

    function allPools(uint256 index) external view override returns (address) {
        return _allPools[index];
    }

    function allPoolsLength() external view override returns (uint256) {
        return _allPools.length;
    }

    // ============ Pool Creation ============

    function createPool(
        address tokenA,
        address tokenB,
        uint256 amplificationParameter
    ) external override returns (address pool) {
        require(tokenA != tokenB, "XyloFactory: IDENTICAL_ADDRESSES");
        require(tokenA != address(0) && tokenB != address(0), "XyloFactory: ZERO_ADDRESS");

        (address token0, address token1) = _sortTokens(tokenA, tokenB);
        require(pools[token0][token1] == address(0), "XyloFactory: POOL_EXISTS");

        uint256 amp = amplificationParameter > 0 ? amplificationParameter : defaultA;

        // Get token symbols for LP token naming
        string memory symbol0 = IERC20(token0).symbol();
        string memory symbol1 = IERC20(token1).symbol();

        string memory lpName = string(abi.encodePacked("XyloNet ", symbol0, "-", symbol1, " LP"));
        string memory lpSymbol = string(abi.encodePacked("XYLO-", symbol0, "-", symbol1));

        // Deploy new pool
        pool = address(
            new XyloStablePool(
                token0,
                token1,
                amp,
                swapFee,
                lpName,
                lpSymbol
            )
        );

        // Register pool
        pools[token0][token1] = pool;
        pools[token1][token0] = pool; // Reverse mapping for easy lookup
        _allPools.push(pool);

        emit PoolCreated(token0, token1, pool, amp, _allPools.length);
    }

    // ============ Admin Functions ============

    function setFeeRecipient(address _feeRecipient) external override onlyOwner {
        require(_feeRecipient != address(0), "XyloFactory: ZERO_ADDRESS");
        address oldRecipient = feeRecipient;
        feeRecipient = _feeRecipient;
        emit FeeRecipientUpdated(oldRecipient, _feeRecipient);
    }

    function setSwapFee(uint256 _swapFee) external override onlyOwner {
        require(_swapFee <= 100, "XyloFactory: FEE_TOO_HIGH"); // Max 1%
        uint256 oldFee = swapFee;
        swapFee = _swapFee;
        emit SwapFeeUpdated(oldFee, _swapFee);
    }

    function setProtocolFee(uint256 _protocolFee) external override onlyOwner {
        require(_protocolFee <= 100, "XyloFactory: FEE_TOO_HIGH"); // Max 100% of swap fee
        protocolFee = _protocolFee;
    }

    function setDefaultA(uint256 _defaultA) external onlyOwner {
        require(_defaultA >= 1 && _defaultA <= 1_000_000, "XyloFactory: INVALID_A");
        uint256 oldA = defaultA;
        defaultA = _defaultA;
        emit DefaultAUpdated(oldA, _defaultA);
    }

    // ============ Ownership Functions ============

    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "XyloFactory: ZERO_ADDRESS");
        pendingOwner = newOwner;
        emit OwnershipTransferStarted(owner, newOwner);
    }

    function acceptOwnership() external {
        require(msg.sender == pendingOwner, "XyloFactory: NOT_PENDING_OWNER");
        address oldOwner = owner;
        owner = pendingOwner;
        pendingOwner = address(0);
        emit OwnershipTransferred(oldOwner, owner);
    }

    // ============ Pool Admin Functions ============

    function rampA(address pool, uint256 futureA, uint256 futureTime) external onlyOwner {
        XyloStablePool(pool).rampA(futureA, futureTime);
    }

    function stopRampA(address pool) external onlyOwner {
        XyloStablePool(pool).stopRampA();
    }

    // ============ Internal Functions ============

    function _sortTokens(address tokenA, address tokenB) internal pure returns (address token0, address token1) {
        (token0, token1) = tokenA < tokenB ? (tokenA, tokenB) : (tokenB, tokenA);
    }
}
