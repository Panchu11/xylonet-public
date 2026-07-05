// Step 2: Register Entity Secret with Circle
import { registerEntitySecretCiphertext } from "@circle-fin/developer-controlled-wallets";
import fs from "fs";

const ENTITY_SECRET = "bdf58704acbc30cec12e09830ae3b7155eecef961f4184ffb989f2e191d44aac";
const API_KEY = "TEST_API_KEY:2d6576514da331e474ccc5cbd455bf06:2a2b0e8577c870e8e71023fce001a508";

async function register() {
  try {
    const response = await registerEntitySecretCiphertext({
      apiKey: API_KEY,
      entitySecret: ENTITY_SECRET,
    });

    console.log("=== REGISTRATION RESPONSE ===");
    console.log(JSON.stringify(response.data, null, 2));

    if (response.data?.recoveryFile) {
      fs.writeFileSync("recovery_file.dat", response.data.recoveryFile);
      console.log("\n=== RECOVERY FILE SAVED ===");
      console.log("Saved to: recovery_file.dat");
      console.log("KEEP THIS FILE SAFE - Circle cannot recover it!");
    }
  } catch (error) {
    console.error("Registration failed:", error.message);
    if (error.response?.data) {
      console.error("Details:", JSON.stringify(error.response.data, null, 2));
    }
  }
}

register();
