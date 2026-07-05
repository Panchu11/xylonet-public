// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import "../interfaces/IXyloRouter.sol";
import "../interfaces/IXyloFactory.sol";
import "../interfaces/IXyloPool.sol";
import "../interfaces/IERC20.sol";

/**
 * @title XyloRouter
 * @notice Router contract for executing swaps and managing liquidity on XyloNet
 * @dev Provides user-friendly interface for interacting with XyloNet pools
 *      Optimized for Arc Network's sub-second finality and USDC-based gas
 */
contract XyloRouter is IXyloRouter {
    address public immutable override factory;
    
    // Arc Testnet stablecoin addresses
    address public immutable override USDC;
    address public immutable override EURC;
    address public immutable override USYC;

    // Reentrancy guard
    uint256 private unlocked = 1;
    modifier lock() {
        require(unlocked == 1, "XyloRouter: LOCKED");
        unlocked = 0;
        _;
        unlocked = 1;
    }

    modifier ensure(uint256 deadline) {
        require(deadline >= block.timestamp, "XyloRouter: EXPIRED");
        _;
    }

    constructor(
        address _factory,
        address _usdc,
        address _eurc,
        address _usyc
    ) {
        factory = _factory;
        USDC = _usdc;
        EURC = _eurc;
        USYC = _usyc;
    }

    // ============ View Functions ============

    function getAmountOut(
        address tokenIn,
        address tokenOut,
        uint256 amountIn
    ) public view override returns (uint256 amountOut) {
        address pool = IXyloFactory(factory).getPool(tokenIn, tokenOut);
        require(pool != address(0), "XyloRouter: POOL_NOT_FOUND");
        amountOut = IXyloPool(pool).calculateSwap(tokenIn, tokenOut, amountIn);
    }

    function getAmountsOut(
        uint256 amountIn,
        address[] calldata path
    ) external view override returns (uint256[] memory amounts) {
        require(path.length >= 2, "XyloRouter: INVALID_PATH");
        amounts = new uint256[](path.length);
        amounts[0] = amountIn;

        for (uint256 i = 0; i < path.length - 1; i++) {
            amounts[i + 1] = getAmountOut(path[i], path[i + 1], amounts[i]);
        }
    }

    function quote(
        address tokenIn,
        address tokenOut,
        uint256 amountIn
    ) external view override returns (uint256 amountOut, uint256 priceImpact) {
        address pool = IXyloFactory(factory).getPool(tokenIn, tokenOut);
        require(pool != address(0), "XyloRouter: POOL_NOT_FOUND");

        amountOut = IXyloPool(pool).calculateSwap(tokenIn, tokenOut, amountIn);

        // Calculate price impact
        // Price impact = (amountIn / amountOut - 1) * 100 (in basis points)
        if (amountOut > 0) {
            // Using 18 decimal precision for calculation
            uint256 idealRate = 1e18; // 1:1 for stablecoins
            uint256 actualRate = (amountOut * 1e18) / amountIn;
            
            if (actualRate < idealRate) {
                priceImpact = ((idealRate - actualRate) * 10000) / idealRate;
            }
        }
    }

    // ============ Swap Functions ============

    function swap(SwapParams calldata params) external override lock ensure(params.deadline) returns (uint256 amountOut) {
        address pool = IXyloFactory(factory).getPool(params.tokenIn, params.tokenOut);
        require(pool != address(0), "XyloRouter: POOL_NOT_FOUND");

        // Transfer tokens to router first
        IERC20(params.tokenIn).transferFrom(msg.sender, address(this), params.amountIn);
        
        // Approve pool to spend tokens
        IERC20(params.tokenIn).approve(pool, params.amountIn);

        // Execute swap
        amountOut = IXyloPool(pool).swap(
            params.tokenIn,
            params.tokenOut,
            params.amountIn,
            params.minAmountOut,
            params.to,
            params.deadline
        );

        emit Swap(msg.sender, params.tokenIn, params.tokenOut, params.amountIn, amountOut, params.to);
    }

    function swapExactTokensForTokens(
        uint256 amountIn,
        uint256 minAmountOut,
        address[] calldata path,
        address to,
        uint256 deadline
    ) external override lock ensure(deadline) returns (uint256[] memory amounts) {
        require(path.length >= 2, "XyloRouter: INVALID_PATH");
        
        amounts = new uint256[](path.length);
        amounts[0] = amountIn;

        // Calculate all amounts first
        for (uint256 i = 0; i < path.length - 1; i++) {
            amounts[i + 1] = getAmountOut(path[i], path[i + 1], amounts[i]);
        }

        require(amounts[path.length - 1] >= minAmountOut, "XyloRouter: INSUFFICIENT_OUTPUT");

        // Transfer initial tokens to router
        IERC20(path[0]).transferFrom(msg.sender, address(this), amountIn);

        // Execute swaps
        for (uint256 i = 0; i < path.length - 1; i++) {
            address pool = IXyloFactory(factory).getPool(path[i], path[i + 1]);
            address recipient = i == path.length - 2 ? to : address(this);

            IERC20(path[i]).approve(pool, amounts[i]);

            IXyloPool(pool).swap(
                path[i],
                path[i + 1],
                amounts[i],
                amounts[i + 1],
                recipient,
                deadline
            );
        }

        emit Swap(msg.sender, path[0], path[path.length - 1], amountIn, amounts[path.length - 1], to);
    }

    function swapTokensForExactTokens(
        uint256 amountOut,
        uint256 maxAmountIn,
        address[] calldata path,
        address to,
        uint256 deadline
    ) external override lock ensure(deadline) returns (uint256[] memory amounts) {
        require(path.length >= 2, "XyloRouter: INVALID_PATH");
        
        amounts = new uint256[](path.length);
        amounts[path.length - 1] = amountOut;

        // Calculate amounts in reverse
        for (uint256 i = path.length - 1; i > 0; i--) {
            address pool = IXyloFactory(factory).getPool(path[i - 1], path[i]);
            require(pool != address(0), "XyloRouter: POOL_NOT_FOUND");
            
            // For simplicity, using forward calculation with buffer
            // In production, implement proper getAmountIn calculation
            amounts[i - 1] = (amounts[i] * 10001) / 10000; // Add 0.01% buffer
        }

        require(amounts[0] <= maxAmountIn, "XyloRouter: EXCESSIVE_INPUT");

        // Transfer initial tokens
        IERC20(path[0]).transferFrom(msg.sender, address(this), amounts[0]);

        // Execute swaps
        for (uint256 i = 0; i < path.length - 1; i++) {
            address pool = IXyloFactory(factory).getPool(path[i], path[i + 1]);
            address recipient = i == path.length - 2 ? to : address(this);

            IERC20(path[i]).approve(pool, amounts[i]);

            amounts[i + 1] = IXyloPool(pool).swap(
                path[i],
                path[i + 1],
                amounts[i],
                0, // No minimum since we calculated expected output
                recipient,
                deadline
            );
        }

        emit Swap(msg.sender, path[0], path[path.length - 1], amounts[0], amounts[path.length - 1], to);
    }

    function swapWithPermit(
        SwapParams calldata swapParams,
        uint256 permitDeadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external override lock ensure(swapParams.deadline) returns (uint256 amountOut) {
        // Execute permit
        IERC20Permit(swapParams.tokenIn).permit(
            msg.sender,
            address(this),
            swapParams.amountIn,
            permitDeadline,
            v,
            r,
            s
        );

        // Execute swap
        address pool = IXyloFactory(factory).getPool(swapParams.tokenIn, swapParams.tokenOut);
        require(pool != address(0), "XyloRouter: POOL_NOT_FOUND");

        IERC20(swapParams.tokenIn).transferFrom(msg.sender, address(this), swapParams.amountIn);
        IERC20(swapParams.tokenIn).approve(pool, swapParams.amountIn);

        amountOut = IXyloPool(pool).swap(
            swapParams.tokenIn,
            swapParams.tokenOut,
            swapParams.amountIn,
            swapParams.minAmountOut,
            swapParams.to,
            swapParams.deadline
        );

        emit Swap(msg.sender, swapParams.tokenIn, swapParams.tokenOut, swapParams.amountIn, amountOut, swapParams.to);
    }

    // ============ Liquidity Functions ============

    function addLiquidity(
        AddLiquidityParams calldata params
    ) external override lock ensure(params.deadline) returns (uint256 lpTokens) {
        address pool = IXyloFactory(factory).getPool(params.tokenA, params.tokenB);
        require(pool != address(0), "XyloRouter: POOL_NOT_FOUND");

        // Transfer tokens to router
        if (params.amountA > 0) {
            IERC20(params.tokenA).transferFrom(msg.sender, address(this), params.amountA);
            IERC20(params.tokenA).approve(pool, params.amountA);
        }
        if (params.amountB > 0) {
            IERC20(params.tokenB).transferFrom(msg.sender, address(this), params.amountB);
            IERC20(params.tokenB).approve(pool, params.amountB);
        }

        // Prepare amounts array in correct order
        (address token0, address token1) = params.tokenA < params.tokenB 
            ? (params.tokenA, params.tokenB) 
            : (params.tokenB, params.tokenA);
        
        uint256[] memory amounts = new uint256[](2);
        if (params.tokenA == token0) {
            amounts[0] = params.amountA;
            amounts[1] = params.amountB;
        } else {
            amounts[0] = params.amountB;
            amounts[1] = params.amountA;
        }

        // Add liquidity
        lpTokens = IXyloPool(pool).addLiquidity(
            amounts,
            params.minLpTokens,
            params.to,
            params.deadline
        );
    }

    function removeLiquidity(
        RemoveLiquidityParams calldata params
    ) external override lock ensure(params.deadline) returns (uint256 amountA, uint256 amountB) {
        address pool = IXyloFactory(factory).getPool(params.tokenA, params.tokenB);
        require(pool != address(0), "XyloRouter: POOL_NOT_FOUND");

        // Transfer LP tokens to router
        IERC20(pool).transferFrom(msg.sender, address(this), params.lpTokenAmount);

        // Prepare min amounts array
        (address token0, address token1) = params.tokenA < params.tokenB 
            ? (params.tokenA, params.tokenB) 
            : (params.tokenB, params.tokenA);
        
        uint256[] memory minAmounts = new uint256[](2);
        if (params.tokenA == token0) {
            minAmounts[0] = params.minAmountA;
            minAmounts[1] = params.minAmountB;
        } else {
            minAmounts[0] = params.minAmountB;
            minAmounts[1] = params.minAmountA;
        }

        // Remove liquidity
        uint256[] memory receivedAmounts = IXyloPool(pool).removeLiquidity(
            params.lpTokenAmount,
            minAmounts,
            params.to,
            params.deadline
        );

        // Return amounts in correct order
        if (params.tokenA == token0) {
            amountA = receivedAmounts[0];
            amountB = receivedAmounts[1];
        } else {
            amountA = receivedAmounts[1];
            amountB = receivedAmounts[0];
        }
    }

    function removeLiquidityOne(
        address tokenA,
        address tokenB,
        uint256 lpTokenAmount,
        uint256 tokenIndex,
        uint256 minAmount,
        address to,
        uint256 deadline
    ) external override lock ensure(deadline) returns (uint256 amount) {
        address pool = IXyloFactory(factory).getPool(tokenA, tokenB);
        require(pool != address(0), "XyloRouter: POOL_NOT_FOUND");

        // Transfer LP tokens to router
        IERC20(pool).transferFrom(msg.sender, address(this), lpTokenAmount);

        // Remove liquidity
        amount = IXyloPool(pool).removeLiquidityOne(
            lpTokenAmount,
            tokenIndex,
            minAmount,
            to,
            deadline
        );
    }

    // ============ Helper Functions ============

    /**
     * @notice Rescue tokens accidentally sent to the router
     * @param token Token address to rescue
     * @param to Recipient address
     * @param amount Amount to rescue
     */
    function rescueTokens(address token, address to, uint256 amount) external {
        require(msg.sender == IXyloFactory(factory).feeRecipient(), "XyloRouter: FORBIDDEN");
        IERC20(token).transfer(to, amount);
    }
}
