import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ENV_PATH = resolve(__dirname, '../.env');

export function getOrCreateWallet() {
  // Check if private key exists in env
  let privateKey = process.env.AGENT_PRIVATE_KEY;

  if (!privateKey || privateKey.length < 64) {
    // Generate new wallet
    privateKey = generatePrivateKey();
    console.log('\n🔑 Generated new agent wallet!\n');
    
    // Save to .env file
    if (existsSync(ENV_PATH)) {
      let envContent = readFileSync(ENV_PATH, 'utf-8');
      if (envContent.includes('AGENT_PRIVATE_KEY=')) {
        envContent = envContent.replace(
          /AGENT_PRIVATE_KEY=.*/,
          `AGENT_PRIVATE_KEY=${privateKey}`
        );
      } else {
        envContent += `\nAGENT_PRIVATE_KEY=${privateKey}\n`;
      }
      writeFileSync(ENV_PATH, envContent);
    } else {
      writeFileSync(ENV_PATH, `AGENT_PRIVATE_KEY=${privateKey}\n`);
    }
    
    console.log(`   Private Key: ${privateKey}`);
    console.log(`   ⚠️  Saved to .env — keep this safe!\n`);
  }

  const account = privateKeyToAccount(privateKey as `0x${string}`);
  return { account, privateKey };
}

// Run directly to generate/show wallet info
if (process.argv[1] && process.argv[1].includes('wallet')) {
  import('dotenv/config').then(() => {
    const { account } = getOrCreateWallet();
    console.log(`\n📋 Agent Wallet Info:`);
    console.log(`   Address: ${account.address}`);
    console.log(`   Network: Arc Testnet (Chain ID: 5042002)\n`);
  });
}
