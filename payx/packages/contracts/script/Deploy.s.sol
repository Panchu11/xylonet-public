// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import "forge-std/Script.sol";
import "../src/PayXTipping.sol";
import "../src/MockUSDC.sol";

/**
 * @title DeployPayX
 * @notice Deployment script for PayX contracts on Arc Testnet
 */
contract DeployPayX is Script {
    // Configuration
    uint256 public constant PLATFORM_FEE_BPS = 100; // 1% fee
    uint256 public constant MIN_TIP_AMOUNT = 0.1 ether; // 0.1 USDC (18 decimals)

    function run() external {
        // Load private key from environment
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        console.log("Deploying PayX contracts...");
        console.log("Deployer:", deployer);

        vm.startBroadcast(deployerPrivateKey);

        // Deploy Mock USDC (for testnet)
        // On mainnet, use the actual USDC address
        MockUSDC usdc = new MockUSDC();
        console.log("MockUSDC deployed at:", address(usdc));

        // Deploy PayX Tipping contract
        // Oracle signer is the deployer for now (should be a separate key in production)
        PayXTipping payX = new PayXTipping(
            address(usdc),      // USDC address
            deployer,           // Oracle signer (update in production)
            deployer,           // Fee recipient
            PLATFORM_FEE_BPS,   // 1% platform fee
            MIN_TIP_AMOUNT      // 0.1 USDC minimum tip
        );
        console.log("PayXTipping deployed at:", address(payX));

        // Mint some test USDC to deployer
        usdc.mint(deployer, 10000 * 10**18); // 10,000 USDC
        console.log("Minted 10,000 test USDC to deployer");

        vm.stopBroadcast();

        // Output deployment info
        console.log("");
        console.log("=== Deployment Complete ===");
        console.log("Network: Arc Testnet");
        console.log("MockUSDC:", address(usdc));
        console.log("PayXTipping:", address(payX));
        console.log("");
        console.log("Update your .env file with:");
        console.log("USDC_CONTRACT_ADDRESS=", address(usdc));
        console.log("PAYX_CONTRACT_ADDRESS=", address(payX));
    }
}
