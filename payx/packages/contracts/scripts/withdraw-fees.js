const hre = require("hardhat");

async function main() {
  const PAYX_ADDRESS = "0xA312c384770B7b49E371DF4b7AF730EFEF465913";
  
  console.log("=== PayX Platform Fees ===\n");
  
  const [signer] = await hre.ethers.getSigners();
  console.log("Your wallet:", signer.address);
  
  const payx = await hre.ethers.getContractAt("PayXTipping", PAYX_ADDRESS, signer);
  
  // Check fee settings
  const feeRecipient = await payx.feeRecipient();
  const platformFeeBps = await payx.platformFeeBps();
  const totalFeesCollected = await payx.totalFeesCollected();
  
  console.log("\nFee Configuration:");
  console.log("  Fee Recipient:", feeRecipient);
  console.log("  Platform Fee:", Number(platformFeeBps) / 100, "%");
  console.log("  Total Fees Collected:", hre.ethers.formatUnits(totalFeesCollected, 18), "USDC");
  
  // Check if there are fees to withdraw
  if (totalFeesCollected > 0n) {
    console.log("\n✅ Fees available to withdraw!");
    
    // Ask user if they want to withdraw
    const args = process.argv.slice(2);
    if (args.includes("--withdraw")) {
      console.log("\nWithdrawing fees...");
      const tx = await payx.withdrawFees();
      await tx.wait();
      console.log("✅ Fees withdrawn successfully!");
      console.log("Transaction:", tx.hash);
    } else {
      console.log("\nTo withdraw fees, run:");
      console.log("  npx hardhat run scripts/withdraw-fees.js --network arcTestnet -- --withdraw");
    }
  } else {
    console.log("\n⚠️ No fees to withdraw yet.");
  }
  
  // Check contract owner
  const owner = await payx.owner();
  console.log("\nContract Owner:", owner);
  console.log("Is you the owner?", owner.toLowerCase() === signer.address.toLowerCase() ? "Yes ✅" : "No ❌");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
