const hre = require("hardhat");

async function main() {
  // Real Circle USDC address on Arc Testnet
  const USDC_ADDRESS = "0x3600000000000000000000000000000000000000";
  const PAYX_ADDRESS = "0xA312c384770B7b49E371DF4b7AF730EFEF465913";
  const USER_ADDRESS = "0x94e0dc7AD29b94EC9819f6cEC3364DD34f41b3c6";

  console.log("Checking balances and allowances...\n");

  // Get contracts
  const usdc = await hre.ethers.getContractAt("MockUSDC", USDC_ADDRESS);
  const payx = await hre.ethers.getContractAt("PayXTipping", PAYX_ADDRESS);

  // Check USDC balance
  const balance = await usdc.balanceOf(USER_ADDRESS);
  console.log("User USDC Balance:", hre.ethers.formatUnits(balance, 18), "USDC");

  // Check allowance
  const allowance = await usdc.allowance(USER_ADDRESS, PAYX_ADDRESS);
  console.log("User Allowance to PayX:", hre.ethers.formatUnits(allowance, 18), "USDC");

  // Check contract settings
  const minTip = await payx.minTipAmount();
  console.log("\nPayX Min Tip Amount:", hre.ethers.formatUnits(minTip, 18), "USDC");

  const oracleSigner = await payx.oracleSigner();
  console.log("PayX Oracle Signer:", oracleSigner);

  const usdcInContract = await payx.usdc();
  console.log("PayX USDC Address:", usdcInContract);
  console.log("Expected USDC Address:", USDC_ADDRESS);
  console.log("USDC addresses match:", usdcInContract.toLowerCase() === USDC_ADDRESS.toLowerCase());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
