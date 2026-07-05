const hre = require("hardhat");

async function main() {
  const PAYX_ADDRESS = "0xA312c384770B7b49E371DF4b7AF730EFEF465913";
  
  const payx = await hre.ethers.getContractAt("PayXTipping", PAYX_ADDRESS);
  
  // Generate calldata for tip("Panchu2605", 5 USDC, "thanks")
  const handle = "Panchu2605";
  const amount = hre.ethers.parseUnits("5", 6); // Real USDC uses 6 decimals
  const message = "thanks";
  
  // Get the encoded calldata
  const calldata = payx.interface.encodeFunctionData("tip", [handle, amount, message]);
  
  console.log("Correct calldata from ethers.js:");
  console.log(calldata);
  console.log("\nCalldata length:", calldata.length, "chars");
  
  // Let's also show the function selector
  const fragment = payx.interface.getFunction("tip");
  console.log("\nFunction selector:", payx.interface.getFunction("tip").selector);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
