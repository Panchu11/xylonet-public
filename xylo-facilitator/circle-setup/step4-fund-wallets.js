// Fund Circle wallets with USDC from main XyloNet wallet
const { createPublicClient, createWalletClient, http, parseUnits, formatUnits } = require('viem');
const { privateKeyToAccount } = require('viem/accounts');

const arcTestnet = {
  id: 5042002,
  name: 'Arc Testnet',
  nativeCurrency: { name: 'USDC', symbol: 'USDC', decimals: 6 },
  rpcUrls: { default: { http: ['https://rpc.testnet.arc.network'] } }
};

const USDC_ABI = [
  {
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' }
    ],
    name: 'transfer',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable', type: 'function'
  },
  {
    inputs: [{ name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view', type: 'function'
  }
];

const USDC_ADDRESS = '0x3600000000000000000000000000000000000000';
const MAIN_KEY = '0x91e2a6083181307cefde599d23ef1adb59fd8f013b9997c24adbaa7beba0d8fb';

async function fund() {
  const account = privateKeyToAccount(MAIN_KEY);
  console.log('Main wallet:', account.address);

  const publicClient = createPublicClient({
    chain: arcTestnet,
    transport: http('https://rpc.testnet.arc.network')
  });

  const walletClient = createWalletClient({
    account,
    chain: arcTestnet,
    transport: http('https://rpc.testnet.arc.network')
  });

  // Check main wallet USDC balance
  const balance = await publicClient.readContract({
    address: USDC_ADDRESS,
    abi: USDC_ABI,
    functionName: 'balanceOf',
    args: [account.address]
  });
  console.log('Main wallet USDC balance:', formatUnits(balance, 6));

  // Wallets to fund
  const wallets = {
    'Buyer Agent': '0x9e91caaa45a70582fecba6d99715907f715d0957',
    'Seller Agent': '0xa37afc9d6b091142043dc4ed63f9e1ba60a3faef',
    'Facilitator Settlement': '0xe6154ec6580b25f726fc802bbc1fd6377902f29e'
  };

  // Fund each with 100 USDC
  const fundAmount = parseUnits('100', 6);

  for (const [name, address] of Object.entries(wallets)) {
    try {
      console.log(`\nFunding ${name} (${address}) with 100 USDC...`);

      const hash = await walletClient.writeContract({
        address: USDC_ADDRESS,
        abi: USDC_ABI,
        functionName: 'transfer',
        args: [address, fundAmount],
        gasPrice: BigInt(160000000000) // 160 Gwei minimum for Arc
      });

      console.log(`  Tx hash: ${hash}`);

      // Wait for confirmation
      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      console.log(`  Status: ${receipt.status === 'success' ? 'SUCCESS' : 'FAILED'}`);
    } catch (error) {
      console.error(`  Failed: ${error.message}`);
    }
  }

  // Verify balances
  console.log('\n=== Final Balances ===');
  for (const [name, address] of Object.entries(wallets)) {
    const bal = await publicClient.readContract({
      address: USDC_ADDRESS,
      abi: USDC_ABI,
      functionName: 'balanceOf',
      args: [address]
    });
    console.log(`${name} (${address}): ${formatUnits(bal, 6)} USDC`);
  }

  // Main wallet final balance
  const finalBalance = await publicClient.readContract({
    address: USDC_ADDRESS,
    abi: USDC_ABI,
    functionName: 'balanceOf',
    args: [account.address]
  });
  console.log(`Main wallet: ${formatUnits(finalBalance, 6)} USDC`);
}

fund().catch(console.error);
