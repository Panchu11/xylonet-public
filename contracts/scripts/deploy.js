const hre = require("hardhat");

// Arc Testnet addresses
const USDC = "0x3600000000000000000000000000000000000000";
const EURC = "0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a";
const USYC = "0xe9185F0c5F296Ed1797AaE4238D26CCaBEadb86C";
const CCTP_TOKEN_MESSENGER = "0x8FE6B999Dc680CcFDD5Bf7EB0974218be2542DAA";
const CCTP_MESSAGE_TRANSMITTER = "0xE737e5cEBEEBa77EFE34D4aa090756590b1CE275";

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  
  console.log("===============================================");
  console.log("       XyloNet Deployment to Arc Testnet       ");
  console.log("===============================================");
  console.log("");
  console.log("Deploying contracts with account:", deployer.address);
  
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", hre.ethers.formatUnits(balance, 18), "USDC");
  console.log("");

  // 1. Deploy XyloFactory
  console.log("1. Deploying XyloFactory...");
  const XyloFactory = await hre.ethers.getContractFactory("XyloFactory");
  const factory = await XyloFactory.deploy(deployer.address);
  await factory.waitForDeployment();
  const factoryAddress = await factory.getAddress();
  console.log("   XyloFactory deployed to:", factoryAddress);

  // 2. Deploy XyloRouter
  console.log("2. Deploying XyloRouter...");
  const XyloRouter = await hre.ethers.getContractFactory("XyloRouter");
  const router = await XyloRouter.deploy(factoryAddress, USDC, EURC, USYC);
  await router.waitForDeployment();
  const routerAddress = await router.getAddress();
  console.log("   XyloRouter deployed to:", routerAddress);

  // 3. Deploy XyloBridge
  console.log("3. Deploying XyloBridge...");
  const XyloBridge = await hre.ethers.getContractFactory("XyloBridge");
  const bridge = await XyloBridge.deploy(CCTP_TOKEN_MESSENGER, CCTP_MESSAGE_TRANSMITTER, USDC);
  await bridge.waitForDeployment();
  const bridgeAddress = await bridge.getAddress();
  console.log("   XyloBridge deployed to:", bridgeAddress);

  // 4. Deploy XyloVault for USDC
  console.log("4. Deploying XyloVault (USDC)...");
  const XyloVault = await hre.ethers.getContractFactory("XyloVault");
  const vault = await XyloVault.deploy(USDC, "XyloNet USDC Vault", "xyUSDC", deployer.address);
  await vault.waitForDeployment();
  const vaultAddress = await vault.getAddress();
  console.log("   XyloVault deployed to:", vaultAddress);

  // 5. Create USDC-EURC Pool
  console.log("5. Creating USDC-EURC Pool (A=200)...");
  const tx1 = await factory.createPool(USDC, EURC, 200);
  await tx1.wait();
  const usdcEurcPool = await factory.getPool(USDC, EURC);
  console.log("   USDC-EURC Pool created at:", usdcEurcPool);

  // 6. Create USDC-USYC Pool
  console.log("6. Creating USDC-USYC Pool (A=100)...");
  const tx2 = await factory.createPool(USDC, USYC, 100);
  await tx2.wait();
  const usdcUsycPool = await factory.getPool(USDC, USYC);
  console.log("   USDC-USYC Pool created at:", usdcUsycPool);

  // Summary
  console.log("");
  console.log("===============================================");
  console.log("           Deployment Complete!                ");
  console.log("===============================================");
  console.log("");
  console.log("Contract Addresses:");
  console.log("-------------------");
  console.log("XyloFactory:", factoryAddress);
  console.log("XyloRouter:", routerAddress);
  console.log("XyloBridge:", bridgeAddress);
  console.log("XyloVault:", vaultAddress);
  console.log("USDC-EURC Pool:", usdcEurcPool);
  console.log("USDC-USYC Pool:", usdcUsycPool);
  console.log("");
  console.log("Explorer Links:");
  console.log("---------------");
  console.log("Factory:", `https://testnet.arcscan.app/address/${factoryAddress}`);
  console.log("Router:", `https://testnet.arcscan.app/address/${routerAddress}`);
  console.log("Bridge:", `https://testnet.arcscan.app/address/${bridgeAddress}`);
  console.log("Vault:", `https://testnet.arcscan.app/address/${vaultAddress}`);
  console.log("");
  
  // Return addresses for verification
  return {
    factory: factoryAddress,
    router: routerAddress,
    bridge: bridgeAddress,
    vault: vaultAddress,
    usdcEurcPool,
    usdcUsycPool,
  };
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
