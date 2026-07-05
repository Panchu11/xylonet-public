// PayX Deployment Script for Arc Testnet
// Uses REAL Circle USDC (not MockUSDC)
const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

// ═══════════════════════════════════════════════════════════════════════════
// REAL CIRCLE USDC ON ARC TESTNET
// ═══════════════════════════════════════════════════════════════════════════
const REAL_USDC_ADDRESS = "0x3600000000000000000000000000000000000000";
const USDC_DECIMALS = 6; // Real USDC uses 6 decimals, NOT 18

async function main() {
  console.log("╔═══════════════════════════════════════════════════════════╗");
  console.log("║     PayX Contract Deployment - Arc Testnet (Real USDC)    ║");
  console.log("╚═══════════════════════════════════════════════════════════╝\n");

  // Get deployer
  const [deployer] = await hre.ethers.getSigners();
  console.log("👛 Deploying with account:", deployer.address);
  
  // Check balance (Arc uses USDC as gas token)
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", hre.ethers.formatUnits(balance, 18), "USDC (gas)\n");

  if (balance === 0n) {
    console.log("⚠️  Warning: Wallet has no balance!");
    console.log("   Please get test USDC from: https://faucet.circle.com");
    console.log("   Select 'Arc Testnet' and paste your address:", deployer.address);
    process.exit(1);
  }

  // Using REAL Circle USDC - no deployment needed
  console.log("📍 Using Real Circle USDC:", REAL_USDC_ADDRESS);
  console.log("   Decimals: 6 (standard USDC)\n");

  // Deploy PayXTipping with REAL USDC
  console.log("📦 Deploying PayXTipping (with Real USDC)...");
  const PayXTipping = await hre.ethers.getContractFactory("PayXTipping");
  
  const platformFeeBps = 100; // 1%
  // IMPORTANT: Real USDC uses 6 decimals, so 0.1 USDC = 100000 (not 0.1 * 10^18)
  const minTipAmount = hre.ethers.parseUnits("0.1", USDC_DECIMALS); // 100000 wei

  console.log("   Platform Fee: 1% (", platformFeeBps, "bps)");
  console.log("   Min Tip Amount: 0.1 USDC (", minTipAmount.toString(), "wei)\n");

  const payXTipping = await PayXTipping.deploy(
    REAL_USDC_ADDRESS,     // Real Circle USDC address
    deployer.address,      // Oracle signer
    deployer.address,      // Fee recipient
    platformFeeBps,        // 1% platform fee
    minTipAmount           // 0.1 USDC minimum (6 decimals)
  );
  await payXTipping.waitForDeployment();
  const payXAddress = await payXTipping.getAddress();
  console.log("   ✅ PayXTipping deployed to:", payXAddress);

  // Verify configuration
  const oracleSigner = await payXTipping.oracleSigner();
  const usdcInContract = await payXTipping.usdc();
  console.log("\n📋 Contract Configuration:");
  console.log("   Oracle Signer:", oracleSigner);
  console.log("   USDC Address:", usdcInContract);
  console.log("   USDC Matches:", usdcInContract.toLowerCase() === REAL_USDC_ADDRESS.toLowerCase() ? "✅ YES" : "❌ NO");

  // Print summary
  console.log("\n╔═══════════════════════════════════════════════════════════╗");
  console.log("║              DEPLOYMENT SUCCESSFUL (Real USDC)            ║");
  console.log("╠═══════════════════════════════════════════════════════════╣");
  console.log(`║  USDC (Circle):  ${REAL_USDC_ADDRESS}  ║`);
  console.log(`║  PayXTipping:    ${payXAddress}  ║`);
  console.log("╚═══════════════════════════════════════════════════════════╝\n");

  // Print env update instructions
  console.log("📝 Update your .env file with these values:\n");
  console.log(`PAYX_CONTRACT_ADDRESS=${payXAddress}`);
  console.log(`USDC_CONTRACT_ADDRESS=${REAL_USDC_ADDRESS}`);
  console.log(`NEXT_PUBLIC_PAYX_CONTRACT_ADDRESS=${payXAddress}`);
  console.log(`NEXT_PUBLIC_USDC_CONTRACT_ADDRESS=${REAL_USDC_ADDRESS}`);

  // Save deployment info
  const deploymentInfo = {
    network: "Arc Testnet",
    chainId: 5042002,
    deployedAt: new Date().toISOString(),
    deployer: deployer.address,
    usdcType: "Real Circle USDC",
    usdcDecimals: USDC_DECIMALS,
    contracts: {
      USDC: REAL_USDC_ADDRESS,
      PayXTipping: payXAddress
    },
    configuration: {
      platformFeeBps: platformFeeBps,
      minTipAmount: "0.1 USDC (100000 wei @ 6 decimals)",
      oracleSigner: deployer.address,
      feeRecipient: deployer.address
    }
  };

  const deploymentPath = path.join(__dirname, "../deployment.json");
  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
  console.log("\n💾 Deployment info saved to deployment.json");

  // Verify on explorer
  console.log("\n🔍 View on ArcScan:");
  console.log(`   USDC (Circle): https://testnet.arcscan.app/address/${REAL_USDC_ADDRESS}`);
  console.log(`   PayXTipping: https://testnet.arcscan.app/address/${payXAddress}`);
  
  console.log("\n⚠️  IMPORTANT: After deployment, update these files:");
  console.log("   1. frontend/src/config/abis/PayXTipping.ts - PAYX_CONTRACT_ADDRESS");
  console.log("   2. payx/apps/extension/*.js - Contract addresses");
  console.log("   3. All API routes already use 6 decimals after migration");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
