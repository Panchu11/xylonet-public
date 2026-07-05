const hre = require("hardhat");

// Arc Testnet CCTP V2 addresses
const USDC = "0x3600000000000000000000000000000000000000";
const CCTP_TOKEN_MESSENGER_V2 = "0x8FE6B999Dc680CcFDD5Bf7EB0974218be2542DAA";
const CCTP_MESSAGE_TRANSMITTER_V2 = "0xE737e5cEBEEBa77EFE34D4aa090756590b1CE275";

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  
  console.log("===============================================");
  console.log("    XyloBridge V2 Deployment to Arc Testnet    ");
  console.log("===============================================");
  console.log("");
  console.log("Deploying with account:", deployer.address);
  
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", hre.ethers.formatUnits(balance, 18), "USDC");
  console.log("");
  console.log("Using CCTP V2 Contracts:");
  console.log("  TokenMessengerV2:", CCTP_TOKEN_MESSENGER_V2);
  console.log("  MessageTransmitterV2:", CCTP_MESSAGE_TRANSMITTER_V2);
  console.log("");

  // Deploy XyloBridge with CCTP V2 support
  console.log("Deploying XyloBridge (CCTP V2)...");
  const XyloBridge = await hre.ethers.getContractFactory("XyloBridge");
  const bridge = await XyloBridge.deploy(
    CCTP_TOKEN_MESSENGER_V2, 
    CCTP_MESSAGE_TRANSMITTER_V2, 
    USDC
  );
  await bridge.waitForDeployment();
  const bridgeAddress = await bridge.getAddress();
  
  console.log("");
  console.log("===============================================");
  console.log("           Deployment Complete!                ");
  console.log("===============================================");
  console.log("");
  console.log("XyloBridge V2 deployed to:", bridgeAddress);
  console.log("");
  console.log("Explorer Link:");
  console.log(`https://testnet.arcscan.app/address/${bridgeAddress}`);
  console.log("");
  console.log("Update frontend/src/config/constants.ts:");
  console.log(`  BRIDGE: '${bridgeAddress}' as \`0x\${string}\`,`);
  console.log("");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
