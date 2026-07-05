// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

/**
 * @title IXyloFactory
 * @notice Factory interface for creating and managing XyloNet liquidity pools
 */
interface IXyloFactory {
    // Events
    event PoolCreated(
        address indexed token0,
        address indexed token1,
        address pool,
        uint256 amplificationParameter,
        uint256 poolCount
    );
    event FeeRecipientUpdated(address indexed oldRecipient, address indexed newRecipient);
    event SwapFeeUpdated(uint256 oldFee, uint256 newFee);

    // View functions
    function getPool(address tokenA, address tokenB) external view returns (address pool);
    function allPools(uint256 index) external view returns (address pool);
    function allPoolsLength() external view returns (uint256);
    function feeRecipient() external view returns (address);
    function swapFee() external view returns (uint256);
    function protocolFee() external view returns (uint256);

    // State-changing functions
    function createPool(
        address tokenA,
        address tokenB,
        uint256 amplificationParameter
    ) external returns (address pool);

    function setFeeRecipient(address _feeRecipient) external;
    function setSwapFee(uint256 _swapFee) external;
    function setProtocolFee(uint256 _protocolFee) external;
}
