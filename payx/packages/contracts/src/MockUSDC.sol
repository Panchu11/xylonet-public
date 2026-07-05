// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @title MockUSDC
 * @notice Mock USDC token for testing on Arc Testnet
 * @dev Anyone can mint tokens for testing purposes
 */
contract MockUSDC is ERC20 {
    uint8 private constant DECIMALS = 18;

    constructor() ERC20("USD Coin", "USDC") {}

    function decimals() public pure override returns (uint8) {
        return DECIMALS;
    }

    /**
     * @notice Mint tokens to an address (for testing only)
     * @param to Recipient address
     * @param amount Amount to mint
     */
    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }

    /**
     * @notice Faucet function - mint 1000 USDC to caller
     */
    function faucet() external {
        _mint(msg.sender, 1000 * 10**DECIMALS);
    }
}
