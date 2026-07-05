// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import "./XyloERC20.sol";
import "../interfaces/IXyloPool.sol";
import "../interfaces/IERC20.sol";

/**
 * @title XyloStablePool
 * @notice StableSwap AMM pool optimized for stablecoin pairs on Arc Network
 * @dev Implements Curve's StableSwap invariant for minimal slippage on pegged assets
 *      Leverages Arc's sub-second finality for instant settlement
 */
contract XyloStablePool is XyloERC20, IXyloPool {
    // Pool tokens
    address public immutable override token0;
    address public immutable override token1;
    
    // Token decimals for normalization
    uint8 public immutable decimals0;
    uint8 public immutable decimals1;
    
    // Precision multipliers (to normalize to 18 decimals)
    uint256 public immutable precisionMultiplier0;
    uint256 public immutable precisionMultiplier1;

    // Pool reserves
    uint256 private reserve0;
    uint256 private reserve1;

    // Amplification parameter (A)
    uint256 public initialA;
    uint256 public futureA;
    uint256 public initialATime;
    uint256 public futureATime;

    // Fee configuration (in basis points, 1 = 0.01%)
    uint256 public swapFee; // Default 4 bps (0.04%)
    uint256 public constant MAX_SWAP_FEE = 100; // 1%
    uint256 public constant FEE_DENOMINATOR = 10000;

    // Constants
    uint256 public constant A_PRECISION = 100;
    uint256 public constant MAX_A = 1_000_000;
    uint256 public constant MIN_RAMP_TIME = 1 days;
    uint256 public constant MAX_A_CHANGE = 10;
    uint256 private constant N_COINS = 2;

    // Factory address for fee recipient
    address public immutable factory;

    // Reentrancy guard
    uint256 private unlocked = 1;
    modifier lock() {
        require(unlocked == 1, "XyloPool: LOCKED");
        unlocked = 0;
        _;
        unlocked = 1;
    }

    modifier ensure(uint256 deadline) {
        require(deadline >= block.timestamp, "XyloPool: EXPIRED");
        _;
    }

    constructor(
        address _token0,
        address _token1,
        uint256 _A,
        uint256 _swapFee,
        string memory _name,
        string memory _symbol
    ) XyloERC20(_name, _symbol) {
        require(_token0 != address(0) && _token1 != address(0), "XyloPool: ZERO_ADDRESS");
        require(_token0 != _token1, "XyloPool: IDENTICAL_ADDRESSES");
        require(_A >= 1 && _A <= MAX_A, "XyloPool: INVALID_A");
        require(_swapFee <= MAX_SWAP_FEE, "XyloPool: INVALID_FEE");

        factory = msg.sender;
        token0 = _token0;
        token1 = _token1;

        decimals0 = IERC20(_token0).decimals();
        decimals1 = IERC20(_token1).decimals();

        precisionMultiplier0 = 10 ** (18 - decimals0);
        precisionMultiplier1 = 10 ** (18 - decimals1);

        initialA = _A * A_PRECISION;
        futureA = _A * A_PRECISION;
        swapFee = _swapFee;
    }

    // ============ View Functions ============

    function getReserves() external view override returns (uint256, uint256) {
        return (reserve0, reserve1);
    }

    function getAmplificationParameter() public view override returns (uint256) {
        uint256 t1 = futureATime;
        uint256 a1 = futureA;

        if (block.timestamp < t1) {
            uint256 t0 = initialATime;
            uint256 a0 = initialA;
            
            if (a1 > a0) {
                return a0 + ((a1 - a0) * (block.timestamp - t0)) / (t1 - t0);
            } else {
                return a0 - ((a0 - a1) * (block.timestamp - t0)) / (t1 - t0);
            }
        }
        return a1;
    }

    function getPoolInfo() external view override returns (PoolInfo memory) {
        return PoolInfo({
            token0: token0,
            token1: token1,
            reserve0: reserve0,
            reserve1: reserve1,
            amplificationParameter: getAmplificationParameter(),
            swapFee: swapFee,
            totalSupply: totalSupply
        });
    }

    function getVirtualPrice() external view override returns (uint256) {
        if (totalSupply == 0) return 1e18;
        
        uint256 d = _getD(_xp(reserve0, reserve1), getAmplificationParameter());
        return (d * 1e18) / totalSupply;
    }

    function calculateSwap(
        address tokenIn,
        address tokenOut,
        uint256 amountIn
    ) external view override returns (uint256 amountOut) {
        require(amountIn > 0, "XyloPool: ZERO_AMOUNT");
        (uint256 i, uint256 j) = _getTokenIndices(tokenIn, tokenOut);
        
        uint256[] memory xp = new uint256[](N_COINS);
        xp[0] = reserve0 * precisionMultiplier0;
        xp[1] = reserve1 * precisionMultiplier1;

        uint256 x = xp[i] + (amountIn * (i == 0 ? precisionMultiplier0 : precisionMultiplier1));
        uint256 y = _getY(i, j, x, xp);
        
        uint256 dy = xp[j] - y - 1;
        uint256 fee = (dy * swapFee) / FEE_DENOMINATOR;
        
        amountOut = (dy - fee) / (j == 0 ? precisionMultiplier0 : precisionMultiplier1);
    }

    function calculateAddLiquidity(
        uint256[] calldata amounts
    ) external view override returns (uint256 lpTokens) {
        require(amounts.length == N_COINS, "XyloPool: INVALID_AMOUNTS");

        uint256[] memory xp = new uint256[](N_COINS);
        xp[0] = reserve0 * precisionMultiplier0;
        xp[1] = reserve1 * precisionMultiplier1;

        uint256 amp = getAmplificationParameter();
        uint256 d0 = totalSupply == 0 ? 0 : _getD(xp, amp);

        uint256[] memory newXp = new uint256[](N_COINS);
        newXp[0] = xp[0] + (amounts[0] * precisionMultiplier0);
        newXp[1] = xp[1] + (amounts[1] * precisionMultiplier1);

        uint256 d1 = _getD(newXp, amp);
        require(d1 > d0, "XyloPool: D_DECREASED");

        if (totalSupply == 0) {
            lpTokens = d1;
        } else {
            lpTokens = ((d1 - d0) * totalSupply) / d0;
        }
    }

    function calculateRemoveLiquidity(
        uint256 lpTokenAmount
    ) external view override returns (uint256[] memory amounts) {
        amounts = new uint256[](N_COINS);
        if (totalSupply == 0) return amounts;

        amounts[0] = (reserve0 * lpTokenAmount) / totalSupply;
        amounts[1] = (reserve1 * lpTokenAmount) / totalSupply;
    }

    function calculateRemoveLiquidityOne(
        uint256 lpTokenAmount,
        uint256 tokenIndex
    ) external view override returns (uint256 amount) {
        require(tokenIndex < N_COINS, "XyloPool: INVALID_INDEX");
        (amount, ) = _calculateRemoveLiquidityOne(lpTokenAmount, tokenIndex);
    }

    // ============ State Changing Functions ============

    function swap(
        address tokenIn,
        address tokenOut,
        uint256 amountIn,
        uint256 minAmountOut,
        address to,
        uint256 deadline
    ) external override lock ensure(deadline) returns (uint256 amountOut) {
        require(amountIn > 0, "XyloPool: ZERO_AMOUNT");
        require(to != address(0), "XyloPool: ZERO_ADDRESS");

        (uint256 i, uint256 j) = _getTokenIndices(tokenIn, tokenOut);

        // Transfer tokens in
        IERC20(tokenIn).transferFrom(msg.sender, address(this), amountIn);

        // Calculate output
        uint256[] memory xp = _xp(reserve0, reserve1);
        uint256 x = xp[i] + (amountIn * (i == 0 ? precisionMultiplier0 : precisionMultiplier1));
        uint256 y = _getY(i, j, x, xp);

        uint256 dy = xp[j] - y - 1;
        uint256 fee = (dy * swapFee) / FEE_DENOMINATOR;

        amountOut = (dy - fee) / (j == 0 ? precisionMultiplier0 : precisionMultiplier1);
        require(amountOut >= minAmountOut, "XyloPool: INSUFFICIENT_OUTPUT");

        // Update reserves
        if (i == 0) {
            reserve0 += amountIn;
            reserve1 -= amountOut;
        } else {
            reserve0 -= amountOut;
            reserve1 += amountIn;
        }

        // Transfer tokens out
        IERC20(tokenOut).transfer(to, amountOut);

        emit Swap(msg.sender, tokenIn, tokenOut, amountIn, amountOut, to);
    }

    function addLiquidity(
        uint256[] calldata amounts,
        uint256 minLpTokens,
        address to,
        uint256 deadline
    ) external override lock ensure(deadline) returns (uint256 lpTokens) {
        require(amounts.length == N_COINS, "XyloPool: INVALID_AMOUNTS");
        require(to != address(0), "XyloPool: ZERO_ADDRESS");

        uint256[] memory xp = _xp(reserve0, reserve1);
        uint256 amp = getAmplificationParameter();
        uint256 d0 = totalSupply == 0 ? 0 : _getD(xp, amp);

        // Transfer tokens in
        if (amounts[0] > 0) {
            IERC20(token0).transferFrom(msg.sender, address(this), amounts[0]);
        }
        if (amounts[1] > 0) {
            IERC20(token1).transferFrom(msg.sender, address(this), amounts[1]);
        }

        // Calculate new D
        uint256[] memory newXp = new uint256[](N_COINS);
        newXp[0] = xp[0] + (amounts[0] * precisionMultiplier0);
        newXp[1] = xp[1] + (amounts[1] * precisionMultiplier1);

        uint256 d1 = _getD(newXp, amp);
        require(d1 > d0, "XyloPool: D_DECREASED");

        // Calculate LP tokens to mint
        if (totalSupply == 0) {
            lpTokens = d1;
        } else {
            lpTokens = ((d1 - d0) * totalSupply) / d0;
        }

        require(lpTokens >= minLpTokens, "XyloPool: INSUFFICIENT_LP_TOKENS");

        // Update reserves
        reserve0 += amounts[0];
        reserve1 += amounts[1];

        // Mint LP tokens
        _mint(to, lpTokens);

        emit AddLiquidity(msg.sender, amounts, lpTokens);
    }

    function removeLiquidity(
        uint256 lpTokenAmount,
        uint256[] calldata minAmounts,
        address to,
        uint256 deadline
    ) external override lock ensure(deadline) returns (uint256[] memory amounts) {
        require(minAmounts.length == N_COINS, "XyloPool: INVALID_AMOUNTS");
        require(to != address(0), "XyloPool: ZERO_ADDRESS");
        require(lpTokenAmount > 0, "XyloPool: ZERO_AMOUNT");

        amounts = new uint256[](N_COINS);
        amounts[0] = (reserve0 * lpTokenAmount) / totalSupply;
        amounts[1] = (reserve1 * lpTokenAmount) / totalSupply;

        require(amounts[0] >= minAmounts[0], "XyloPool: INSUFFICIENT_AMOUNT_0");
        require(amounts[1] >= minAmounts[1], "XyloPool: INSUFFICIENT_AMOUNT_1");

        // Burn LP tokens
        _burn(msg.sender, lpTokenAmount);

        // Update reserves
        reserve0 -= amounts[0];
        reserve1 -= amounts[1];

        // Transfer tokens out
        IERC20(token0).transfer(to, amounts[0]);
        IERC20(token1).transfer(to, amounts[1]);

        emit RemoveLiquidity(msg.sender, amounts, lpTokenAmount);
    }

    function removeLiquidityOne(
        uint256 lpTokenAmount,
        uint256 tokenIndex,
        uint256 minAmount,
        address to,
        uint256 deadline
    ) external override lock ensure(deadline) returns (uint256 amount) {
        require(tokenIndex < N_COINS, "XyloPool: INVALID_INDEX");
        require(to != address(0), "XyloPool: ZERO_ADDRESS");
        require(lpTokenAmount > 0, "XyloPool: ZERO_AMOUNT");

        uint256 fee;
        (amount, fee) = _calculateRemoveLiquidityOne(lpTokenAmount, tokenIndex);
        require(amount >= minAmount, "XyloPool: INSUFFICIENT_AMOUNT");

        // Burn LP tokens
        _burn(msg.sender, lpTokenAmount);

        // Update reserves
        if (tokenIndex == 0) {
            reserve0 -= amount;
        } else {
            reserve1 -= amount;
        }

        // Transfer tokens out
        address tokenOut = tokenIndex == 0 ? token0 : token1;
        IERC20(tokenOut).transfer(to, amount);

        emit RemoveLiquidityOne(msg.sender, tokenIndex, amount, lpTokenAmount);
    }

    // ============ Admin Functions ============

    function rampA(uint256 _futureA, uint256 _futureTime) external override {
        require(msg.sender == factory, "XyloPool: FORBIDDEN");
        require(block.timestamp >= initialATime + MIN_RAMP_TIME, "XyloPool: TOO_EARLY");
        require(_futureTime >= block.timestamp + MIN_RAMP_TIME, "XyloPool: INSUFFICIENT_TIME");

        uint256 currentA = getAmplificationParameter();
        uint256 futureAPrecision = _futureA * A_PRECISION;

        require(_futureA > 0 && _futureA <= MAX_A, "XyloPool: INVALID_A");
        require(
            (futureAPrecision >= currentA / MAX_A_CHANGE) && 
            (futureAPrecision <= currentA * MAX_A_CHANGE),
            "XyloPool: A_CHANGE_TOO_LARGE"
        );

        initialA = currentA;
        futureA = futureAPrecision;
        initialATime = block.timestamp;
        futureATime = _futureTime;

        emit RampA(currentA, futureAPrecision, block.timestamp, _futureTime);
    }

    function stopRampA() external override {
        require(msg.sender == factory, "XyloPool: FORBIDDEN");

        uint256 currentA = getAmplificationParameter();

        initialA = currentA;
        futureA = currentA;
        initialATime = block.timestamp;
        futureATime = block.timestamp;

        emit StopRampA(currentA, block.timestamp);
    }

    // ============ Internal Functions ============

    function _xp(uint256 _reserve0, uint256 _reserve1) internal view returns (uint256[] memory xp) {
        xp = new uint256[](N_COINS);
        xp[0] = _reserve0 * precisionMultiplier0;
        xp[1] = _reserve1 * precisionMultiplier1;
    }

    function _getTokenIndices(address tokenIn, address tokenOut) internal view returns (uint256 i, uint256 j) {
        require(tokenIn != tokenOut, "XyloPool: SAME_TOKEN");

        if (tokenIn == token0) {
            require(tokenOut == token1, "XyloPool: INVALID_TOKEN");
            return (0, 1);
        } else if (tokenIn == token1) {
            require(tokenOut == token0, "XyloPool: INVALID_TOKEN");
            return (1, 0);
        } else {
            revert("XyloPool: INVALID_TOKEN");
        }
    }

    /**
     * @dev Calculate D (total liquidity) using Newton's method
     * D is the invariant in the StableSwap curve
     */
    function _getD(uint256[] memory xp, uint256 amp) internal pure returns (uint256) {
        uint256 s = xp[0] + xp[1];
        if (s == 0) return 0;

        uint256 d = s;
        uint256 ann = amp * N_COINS;

        for (uint256 i = 0; i < 255; i++) {
            uint256 dP = d;
            for (uint256 j = 0; j < N_COINS; j++) {
                dP = (dP * d) / (xp[j] * N_COINS);
            }
            uint256 dPrev = d;

            // d = (ann * s / A_PRECISION + dP * N_COINS) * d / ((ann - A_PRECISION) * d / A_PRECISION + (N_COINS + 1) * dP)
            uint256 numerator = ((ann * s) / A_PRECISION + dP * N_COINS) * d;
            uint256 denominator = ((ann - A_PRECISION) * d) / A_PRECISION + (N_COINS + 1) * dP;
            d = numerator / denominator;

            if (d > dPrev) {
                if (d - dPrev <= 1) break;
            } else {
                if (dPrev - d <= 1) break;
            }
        }

        return d;
    }

    /**
     * @dev Calculate y given x using Newton's method
     * This finds the output amount for a swap
     */
    function _getY(uint256 i, uint256 j, uint256 x, uint256[] memory xp) internal view returns (uint256) {
        require(i != j, "XyloPool: SAME_INDEX");
        require(i < N_COINS && j < N_COINS, "XyloPool: INVALID_INDEX");

        uint256 amp = getAmplificationParameter();
        uint256 d = _getD(xp, amp);
        uint256 ann = amp * N_COINS;

        uint256 c = d;
        uint256 s = x;

        c = (c * d) / (x * N_COINS);
        c = (c * d * A_PRECISION) / (ann * N_COINS);

        uint256 b = s + (d * A_PRECISION) / ann;

        uint256 y = d;
        for (uint256 k = 0; k < 255; k++) {
            uint256 yPrev = y;
            y = (y * y + c) / (2 * y + b - d);

            if (y > yPrev) {
                if (y - yPrev <= 1) break;
            } else {
                if (yPrev - y <= 1) break;
            }
        }

        return y;
    }

    function _calculateRemoveLiquidityOne(
        uint256 lpTokenAmount,
        uint256 tokenIndex
    ) internal view returns (uint256 amount, uint256 fee) {
        uint256 amp = getAmplificationParameter();
        uint256[] memory xp = _xp(reserve0, reserve1);
        uint256 d0 = _getD(xp, amp);
        uint256 d1 = d0 - (lpTokenAmount * d0) / totalSupply;

        uint256 newY = _getYD(tokenIndex, xp, d1);
        uint256 dy = xp[tokenIndex] - newY;

        // Calculate fee on imbalance
        uint256[] memory reducedXp = new uint256[](N_COINS);
        for (uint256 i = 0; i < N_COINS; i++) {
            uint256 dx = i == tokenIndex ? (xp[i] * lpTokenAmount) / totalSupply : 0;
            reducedXp[i] = xp[i] - dx;
        }

        fee = (dy * swapFee) / FEE_DENOMINATOR;
        amount = (dy - fee) / (tokenIndex == 0 ? precisionMultiplier0 : precisionMultiplier1);
    }

    function _getYD(uint256 tokenIndex, uint256[] memory xp, uint256 d) internal view returns (uint256) {
        uint256 amp = getAmplificationParameter();
        uint256 ann = amp * N_COINS;

        uint256 c = d;
        uint256 s = 0;

        for (uint256 i = 0; i < N_COINS; i++) {
            if (i != tokenIndex) {
                s += xp[i];
                c = (c * d) / (xp[i] * N_COINS);
            }
        }

        c = (c * d * A_PRECISION) / (ann * N_COINS);
        uint256 b = s + (d * A_PRECISION) / ann;

        uint256 y = d;
        for (uint256 k = 0; k < 255; k++) {
            uint256 yPrev = y;
            y = (y * y + c) / (2 * y + b - d);

            if (y > yPrev) {
                if (y - yPrev <= 1) break;
            } else {
                if (yPrev - y <= 1) break;
            }
        }

        return y;
    }
}
