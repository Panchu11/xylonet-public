// Step 3: Create Circle Developer-Controlled Wallets for AgentEscrow
import pkg from "@circle-fin/developer-controlled-wallets";
import fs from "fs";
const { CircleDeveloperControlledWalletsClient, Blockchain } = pkg;

const API_KEY = "TEST_API_KEY:2d6576514da331e474ccc5cbd455bf06:2a2b0e8577c870e8e71023fce001a508";
const ENTITY_SECRET = "bdf58704acbc30cec12e09830ae3b7155eecef961f4184ffb989f2e191d44aac";

const client = new CircleDeveloperControlledWalletsClient({
  apiKey: API_KEY,
  entitySecret: ENTITY_SECRET,
});

async function setup() {
  try {
    // Create a wallet set for XyloFacilitator
    console.log("Creating wallet set for XyloFacilitator...");
    const walletSetResponse = await client.createWalletSet({
      name: "XyloFacilitator AgentEscrow",
    });
    const walletSetId = walletSetResponse.data?.walletSet?.id;
    console.log("Wallet Set ID:", walletSetId);

    // Create Agent Buyer wallet
    console.log("\nCreating Agent Buyer wallet...");
    const buyerWalletResponse = await client.createWallets({
      walletSetId: walletSetId,
      blockchains: [Blockchain.ArcTestnet],
      count: 1,
    });
    const buyerWallet = buyerWalletResponse.data?.wallets?.[0];
    console.log("Buyer Wallet ID:", buyerWallet?.id);
    console.log("Buyer Wallet Address:", buyerWallet?.address);

    // Create Agent Seller wallet
    console.log("\nCreating Agent Seller wallet...");
    const sellerWalletResponse = await client.createWallets({
      walletSetId: walletSetId,
      blockchains: [Blockchain.ArcTestnet],
      count: 1,
    });
    const sellerWallet = sellerWalletResponse.data?.wallets?.[0];
    console.log("Seller Wallet ID:", sellerWallet?.id);
    console.log("Seller Wallet Address:", sellerWallet?.address);

    // Create Facilitator Settlement wallet
    console.log("\nCreating Facilitator Settlement wallet...");
    const facilitatorWalletResponse = await client.createWallets({
      walletSetId: walletSetId,
      blockchains: [Blockchain.ArcTestnet],
      count: 1,
    });
    const facilitatorWallet = facilitatorWalletResponse.data?.wallets?.[0];
    console.log("Facilitator Wallet ID:", facilitatorWallet?.id);
    console.log("Facilitator Wallet Address:", facilitatorWallet?.address);

    // Save everything
    const result = {
      walletSetId,
      buyerWallet: {
        id: buyerWallet?.id,
        address: buyerWallet?.address,
        blockchain: buyerWallet?.blockchain,
      },
      sellerWallet: {
        id: sellerWallet?.id,
        address: sellerWallet?.address,
        blockchain: sellerWallet?.blockchain,
      },
      facilitatorWallet: {
        id: facilitatorWallet?.id,
        address: facilitatorWallet?.address,
        blockchain: facilitatorWallet?.blockchain,
      },
    };

    fs.writeFileSync("wallets.json", JSON.stringify(result, null, 2));
    console.log("\n=== WALLETS SAVED TO wallets.json ===");
    console.log(JSON.stringify(result, null, 2));

  } catch (error) {
    console.error("Setup failed:", error.message);
    if (error.cause) {
      console.error("Cause:", JSON.stringify(error.cause, null, 2));
    }
  }
}

setup();
