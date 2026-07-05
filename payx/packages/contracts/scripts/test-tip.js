const hre = require("hardhat");

async function main() {
  // Real Circle USDC address on Arc Testnet
  const USDC_ADDRESS = "0x3600000000000000000000000000000000000000";
  const PAYX_ADDRESS = "0xA312c384770B7b49E371DF4b7AF730EFEF465913";

  console.log("Testing tip function...\n");

  // Get signer
  const [signer] = await hre.ethers.getSigners();
  console.log("Signer:", signer.address);

  // Get contracts
  const usdc = await hre.ethers.getContractAt("MockUSDC", USDC_ADDRESS, signer);
  const payx = await hre.ethers.getContractAt("PayXTipping", PAYX_ADDRESS, signer);

  // Approve USDC
  const tipAmount = hre.ethers.parseUnits("1", 18);
  console.log("Approving 1 USDC...");
  const approveTx = await usdc.approve(PAYX_ADDRESS, tipAmount);
  await approveTx.wait();
  console.log("Approved!");

  // Send tip
  console.log("\nSending tip to 'testhandle' for 1 USDC...");
  try {
    const tipTx = await payx.tip("testhandle", tipAmount, "Hello from script!");
    const receipt = await tipTx.wait();
    console.log("Tip sent successfully!");
    console.log("Transaction hash:", receipt.hash);
  } catch (error) {
    console.error("Tip failed with error:", error.message);
    if (error.data) {
      console.error("Error data:", error.data);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
