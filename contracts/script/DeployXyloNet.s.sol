// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

/**
 * @title DeployXyloNet
 * @notice Deployment script for XyloNet contracts on Arc Testnet
 * @dev Run with: forge script script/DeployXyloNet.s.sol --rpc-url $ARC_TESTNET_RPC_URL --broadcast
 */

// Import contracts
import "../src/core/XyloFactory.sol";
import "../src/core/XyloRouter.sol";

contract DeployXyloNet {
    // Arc Testnet addresses
    address constant USDC = 0x3600000000000000000000000000000000000000;
    address constant EURC = 0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a;
    address constant USYC = 0xe9185F0c5F296Ed1797AaE4238D26CCaBEadb86C;

    // Deployed contract addresses (filled after deployment)
    XyloFactory public factory;
    XyloRouter public router;
    address public usdcEurcPool;
    address public usdcUsycPool;

    function run() external {
        // Get deployer address from private key
        address deployer = msg.sender;

        // Deploy Factory
        factory = new XyloFactory(deployer);

        // Deploy Router
        router = new XyloRouter(
            address(factory),
            USDC,
            EURC,
            USYC
        );

        // Create USDC-EURC pool (A = 200 for stable pairs)
        usdcEurcPool = factory.createPool(USDC, EURC, 200);

        // Create USDC-USYC pool (A = 100 since USYC may have slight variance)
        usdcUsycPool = factory.createPool(USDC, USYC, 100);
    }
}
