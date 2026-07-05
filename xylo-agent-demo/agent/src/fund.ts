import 'dotenv/config';
import { getOrCreateWallet } from './wallet.js';
import { requestFaucet, checkFaucetStatus } from '@xylofacilitator/sdk';

const FACILITATOR_URL = process.env.FACILITATOR_URL || 'https://api.xylonet.xyz';

async function main() {
  const { account } = getOrCreateWallet();
  
  console.log(`\n💧 XyloFacilitator Testnet Faucet`);
  console.log(`   Agent Address: ${account.address}`);
  console.log(`   Facilitator: ${FACILITATOR_URL}\n`);

  // Check if already funded
  const status = await checkFaucetStatus(account.address, FACILITATOR_URL);
  if (status.funded) {
    console.log(`   ✅ Already funded! (tx: ${status.txHash})\n`);
    return;
  }

  // Request funds
  console.log(`   Requesting 10 USDC from faucet...`);
  try {
    const result = await requestFaucet(account.address, FACILITATOR_URL);
    console.log(`   ✅ Funded! 10 USDC received`);
    console.log(`   TX: ${result.txHash}\n`);
  } catch (error: any) {
    console.error(`   ❌ Faucet error: ${error.message}\n`);
  }
}

main().catch(console.error);
