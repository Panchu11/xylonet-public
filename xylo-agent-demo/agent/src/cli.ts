import 'dotenv/config';
import { createInterface } from 'readline';
import { getOrCreateWallet } from './wallet.js';
import { XyloAgent } from './agent.js';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const FACILITATOR_URL = process.env.FACILITATOR_URL || 'https://api.xylonet.xyz';
const SELLER_API_URL = process.env.SELLER_API_URL || 'http://localhost:4000';

async function main() {
  // Validate config
  if (!OPENAI_API_KEY || OPENAI_API_KEY === 'sk-your-openai-key-here') {
    console.error('\n❌ Missing OPENAI_API_KEY in .env\n');
    process.exit(1);
  }

  // Get or create wallet
  const { account } = getOrCreateWallet();

  console.log(`\n╔══════════════════════════════════════════════════════════════╗`);
  console.log(`║           🤖 XyloFacilitator AI Agent Demo                  ║`);
  console.log(`╠══════════════════════════════════════════════════════════════╣`);
  console.log(`║  Wallet:  ${account.address}  ║`);
  console.log(`║  Network: Arc Testnet (Chain ID: 5042002)                   ║`);
  console.log(`║  Seller:  ${SELLER_API_URL.padEnd(49)}║`);
  console.log(`╠══════════════════════════════════════════════════════════════╣`);
  console.log(`║  This agent pays for API calls with USDC via x402 protocol ║`);
  console.log(`║  Type your questions — the agent will pay for data it needs ║`);
  console.log(`║  Type 'quit' to exit, 'reset' to clear history             ║`);
  console.log(`╚══════════════════════════════════════════════════════════════╝\n`);

  // Create agent
  const agent = new XyloAgent({
    account,
    openaiKey: OPENAI_API_KEY,
    facilitatorUrl: FACILITATOR_URL,
    sellerApiUrl: SELLER_API_URL,
  });

  // Interactive loop
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const prompt = () => {
    rl.question('\n🧑 You: ', async (input) => {
      const trimmed = input.trim();
      
      if (!trimmed) {
        prompt();
        return;
      }

      if (trimmed.toLowerCase() === 'quit' || trimmed.toLowerCase() === 'exit') {
        console.log('\n👋 Goodbye!\n');
        rl.close();
        process.exit(0);
      }

      if (trimmed.toLowerCase() === 'reset') {
        agent.reset();
        console.log('\n🔄 Conversation reset.\n');
        prompt();
        return;
      }

      try {
        console.log('');
        const response = await agent.chat(trimmed);
        console.log(`\n🤖 Agent: ${response}`);
      } catch (error: any) {
        console.error(`\n❌ Error: ${error.message}`);
      }

      prompt();
    });
  };

  prompt();
}

main().catch(console.error);
