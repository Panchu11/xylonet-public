// Step 1: Generate Entity Secret
import { generateEntitySecret } from "@circle-fin/developer-controlled-wallets";

const secret = generateEntitySecret();
console.log("=== CIRCLE ENTITY SECRET ===");
console.log(secret);
console.log("============================");
