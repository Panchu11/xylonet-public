const hre = require("hardhat");

// Deployed contract addresses
const CONTRACTS = {
  USDC: "0x3600000000000000000000000000000000000000",
  EURC: "0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a",
  USYC: "0xe9185F0c5F296Ed1797AaE4238D26CCaBEadb86C",
  USDC_EURC_POOL: "0x3DF3966F5138143dce7a9cFDdC2c0310ce083BB1",
  USDC_USYC_POOL: "0x8296cC7477A9CD12cF632042fDDc2aB89151bb61",
};

// ERC20 ABI for approval and balance check
const ERC20_ABI = [
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function balanceOf(address account) external view returns (uint256)",
  "function decimals() external view returns (uint8)",
  "function symbol() external view returns (string)",
];

// Pool ABI
const POOL_ABI = [
  "function addLiquidity(uint256[] calldata amounts, uint256 minLpTokens, address to, uint256 deadline) external returns (uint256 lpTokens)",
  "function getReserves() external view returns (uint256, uint256)",
  "function token0() external view returns (address)",
  "function token1() external view returns (address)",
  "function totalSupply() external view returns (uint256)",
];

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  
  console.log("===============================================");
  console.log("       Adding Liquidity to XyloNet Pools       ");
  console.log("===============================================");
  console.log("");
  console.log("Using account:", deployer.address);

  // Get token contracts
  const usdc = new hre.ethers.Contract(CONTRACTS.USDC, ERC20_ABI, deployer);
  const eurc = new hre.ethers.Contract(CONTRACTS.EURC, ERC20_ABI, deployer);
  const usyc = new hre.ethers.Contract(CONTRACTS.USYC, ERC20_ABI, deployer);
  
  // Check balances
  const usdcBalance = await usdc.balanceOf(deployer.address);
  const eurcBalance = await eurc.balanceOf(deployer.address);
  const usycBalance = await usyc.balanceOf(deployer.address);
  
  console.log("");
  console.log("Token Balances:");
  console.log("  USDC:", hre.ethers.formatUnits(usdcBalance, 6));
  console.log("  EURC:", hre.ethers.formatUnits(eurcBalance, 6));
  console.log("  USYC:", hre.ethers.formatUnits(usycBalance, 6));
  console.log("");

  // Get pool contracts
  const usdcEurcPool = new hre.ethers.Contract(CONTRACTS.USDC_EURC_POOL, POOL_ABI, deployer);
  const usdcUsycPool = new hre.ethers.Contract(CONTRACTS.USDC_USYC_POOL, POOL_ABI, deployer);

  // Check current reserves
  const [reserve0_1, reserve1_1] = await usdcEurcPool.getReserves();
  const [reserve0_2, reserve1_2] = await usdcUsycPool.getReserves();
  
  console.log("Current Pool Reserves:");
  console.log("  USDC-EURC Pool:", hre.ethers.formatUnits(reserve0_1, 6), "/", hre.ethers.formatUnits(reserve1_1, 6));
  console.log("  USDC-USYC Pool:", hre.ethers.formatUnits(reserve0_2, 6), "/", hre.ethers.formatUnits(reserve1_2, 6));
  console.log("");

  // Amount to add - use minimum of both balances (but at least 0.5 of each)
  const minAmount = hre.ethers.parseUnits("0.5", 6);
  const deadline = Math.floor(Date.now() / 1000) + 3600; // 1 hour

  // Calculate how much we can add to USDC-EURC pool
  const usdcEurcAmount = usdcBalance < eurcBalance ? usdcBalance : eurcBalance;
  
  // Only add liquidity if we have minimum balance
  if (usdcEurcAmount >= minAmount) {
    // Use 90% of available balance to leave some for gas
    const amountToAdd = (usdcEurcAmount * 90n) / 100n;
    
    console.log("1. Adding liquidity to USDC-EURC Pool...");
    console.log("   Amount per token:", hre.ethers.formatUnits(amountToAdd, 6));
    
    // Check token order in pool
    const token0 = await usdcEurcPool.token0();
    console.log("   Pool token0:", token0);
    
    // Approve tokens
    console.log("   Approving USDC...");
    const tx1 = await usdc.approve(CONTRACTS.USDC_EURC_POOL, amountToAdd);
    await tx1.wait();
    
    console.log("   Approving EURC...");
    const tx2 = await eurc.approve(CONTRACTS.USDC_EURC_POOL, amountToAdd);
    await tx2.wait();
    
    // Add liquidity - amounts in token0, token1 order
    const amounts = token0.toLowerCase() === CONTRACTS.USDC.toLowerCase() 
      ? [amountToAdd, amountToAdd]  // USDC is token0
      : [amountToAdd, amountToAdd]; // EURC is token0
    
    console.log("   Adding liquidity with amounts:", amounts.map(a => hre.ethers.formatUnits(a, 6)).join(", "));
    const tx3 = await usdcEurcPool.addLiquidity(amounts, 0, deployer.address, deadline);
    const receipt = await tx3.wait();
    console.log("   Liquidity added! TX:", receipt.hash);
  } else {
    console.log("Insufficient balance for USDC-EURC pool. Need at least 0.5 USDC and 0.5 EURC.");
    console.log("Get testnet tokens from: https://faucet.circle.com");
  }

  // Skip USDC-USYC pool for now since we have no USYC
  console.log("");
  console.log("Note: Skipping USDC-USYC pool (no USYC balance).");

  // Final reserves check
  console.log("");
  console.log("Final Pool Reserves:");
  const [finalReserve0_1, finalReserve1_1] = await usdcEurcPool.getReserves();
  const [finalReserve0_2, finalReserve1_2] = await usdcUsycPool.getReserves();
  console.log("  USDC-EURC Pool:", hre.ethers.formatUnits(finalReserve0_1, 6), "/", hre.ethers.formatUnits(finalReserve1_1, 6));
  console.log("  USDC-USYC Pool:", hre.ethers.formatUnits(finalReserve0_2, 6), "/", hre.ethers.formatUnits(finalReserve1_2, 6));
  console.log("");
  console.log("Done!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
