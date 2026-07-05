// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

/**
 * @title IXyloPool
 * @notice Interface for XyloNet StableSwap liquidity pools
 */
interface IXyloPool {
    // Events
    event Swap(
        address indexed sender,
        address indexed tokenIn,
        address indexed tokenOut,
        uint256 amountIn,
        uint256 amountOut,
        address to
    );
    event AddLiquidity(
        address indexed provider,
        uint256[] amounts,
        uint256 lpTokensMinted
    );
    event RemoveLiquidity(
        address indexed provider,
        uint256[] amounts,
        uint256 lpTokensBurned
    );
    event RemoveLiquidityOne(
        address indexed provider,
        uint256 tokenIndex,
        uint256 amount,
        uint256 lpTokensBurned
    );
    event RampA(uint256 oldA, uint256 newA, uint256 initialTime, uint256 futureTime);
    event StopRampA(uint256 currentA, uint256 time);

    // Structs
    struct PoolInfo {
        address token0;
        address token1;
        uint256 reserve0;
        uint256 reserve1;
        uint256 amplificationParameter;
        uint256 swapFee;
        uint256 totalSupply;
    }

    // View functions
    function token0() external view returns (address);
    function token1() external view returns (address);
    function getReserves() external view returns (uint256 reserve0, uint256 reserve1);
    function getAmplificationParameter() external view returns (uint256);
    function getPoolInfo() external view returns (PoolInfo memory);
    function getVirtualPrice() external view returns (uint256);
    
    function calculateSwap(
        address tokenIn,
        address tokenOut,
        uint256 amountIn
    ) external view returns (uint256 amountOut);

    function calculateAddLiquidity(
        uint256[] calldata amounts
    ) external view returns (uint256 lpTokens);

    function calculateRemoveLiquidity(
        uint256 lpTokenAmount
    ) external view returns (uint256[] memory amounts);

    function calculateRemoveLiquidityOne(
        uint256 lpTokenAmount,
        uint256 tokenIndex
    ) external view returns (uint256 amount);

    // State-changing functions
    function swap(
        address tokenIn,
        address tokenOut,
        uint256 amountIn,
        uint256 minAmountOut,
        address to,
        uint256 deadline
    ) external returns (uint256 amountOut);

    function addLiquidity(
        uint256[] calldata amounts,
        uint256 minLpTokens,
        address to,
        uint256 deadline
    ) external returns (uint256 lpTokens);

    function removeLiquidity(
        uint256 lpTokenAmount,
        uint256[] calldata minAmounts,
        address to,
        uint256 deadline
    ) external returns (uint256[] memory amounts);

    function removeLiquidityOne(
        uint256 lpTokenAmount,
        uint256 tokenIndex,
        uint256 minAmount,
        address to,
        uint256 deadline
    ) external returns (uint256 amount);

    // Admin functions
    function rampA(uint256 futureA, uint256 futureTime) external;
    function stopRampA() external;
}
