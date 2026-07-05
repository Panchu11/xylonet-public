// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

/**
 * @title IXyloRouter
 * @notice Router interface for executing swaps and managing liquidity on XyloNet
 */
interface IXyloRouter {
    // Structs
    struct SwapParams {
        address tokenIn;
        address tokenOut;
        uint256 amountIn;
        uint256 minAmountOut;
        address to;
        uint256 deadline;
    }

    struct MultiSwapParams {
        address[] path;
        uint256 amountIn;
        uint256 minAmountOut;
        address to;
        uint256 deadline;
    }

    struct AddLiquidityParams {
        address tokenA;
        address tokenB;
        uint256 amountA;
        uint256 amountB;
        uint256 minLpTokens;
        address to;
        uint256 deadline;
    }

    struct RemoveLiquidityParams {
        address tokenA;
        address tokenB;
        uint256 lpTokenAmount;
        uint256 minAmountA;
        uint256 minAmountB;
        address to;
        uint256 deadline;
    }

    // Events
    event Swap(
        address indexed sender,
        address indexed tokenIn,
        address indexed tokenOut,
        uint256 amountIn,
        uint256 amountOut,
        address to
    );

    // View functions
    function factory() external view returns (address);
    function USDC() external view returns (address);
    function EURC() external view returns (address);
    function USYC() external view returns (address);

    function getAmountsOut(
        uint256 amountIn,
        address[] calldata path
    ) external view returns (uint256[] memory amounts);

    function getAmountOut(
        address tokenIn,
        address tokenOut,
        uint256 amountIn
    ) external view returns (uint256 amountOut);

    function quote(
        address tokenIn,
        address tokenOut,
        uint256 amountIn
    ) external view returns (uint256 amountOut, uint256 priceImpact);

    // Swap functions
    function swap(SwapParams calldata params) external returns (uint256 amountOut);

    function swapExactTokensForTokens(
        uint256 amountIn,
        uint256 minAmountOut,
        address[] calldata path,
        address to,
        uint256 deadline
    ) external returns (uint256[] memory amounts);

    function swapTokensForExactTokens(
        uint256 amountOut,
        uint256 maxAmountIn,
        address[] calldata path,
        address to,
        uint256 deadline
    ) external returns (uint256[] memory amounts);

    // Liquidity functions
    function addLiquidity(
        AddLiquidityParams calldata params
    ) external returns (uint256 lpTokens);

    function removeLiquidity(
        RemoveLiquidityParams calldata params
    ) external returns (uint256 amountA, uint256 amountB);

    function removeLiquidityOne(
        address tokenA,
        address tokenB,
        uint256 lpTokenAmount,
        uint256 tokenIndex,
        uint256 minAmount,
        address to,
        uint256 deadline
    ) external returns (uint256 amount);

    // Permit functions for gasless approvals
    function swapWithPermit(
        SwapParams calldata swapParams,
        uint256 permitDeadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external returns (uint256 amountOut);
}
