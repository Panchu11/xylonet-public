const { createPublicClient, createWalletClient, http, formatUnits, parseUnits, encodeFunctionData } = require('viem');
const { privateKeyToAccount } = require('viem/accounts');

// Arc Testnet chain definition
const arcTestnet = {
  id: 5042002,
  name: 'Arc Testnet',
  nativeCurrency: { name: 'USDC', symbol: 'USDC', decimals: 6 },
  rpcUrls: {
    default: { http: [
      'https://rpc.testnet.arc.network',
      'https://rpc.quicknode.testnet.arc.network',
      'https://rpc.drpc.testnet.arc.network',
      'https://rpc.blockdaemon.testnet.arc.network'
    ]},
    public: { http: [
      'https://testnet.imola.arct.network',
      'https://rpc.testnet.arc.network'
    ]}
  },
  blockExplorers: {
    default: { name: 'ArcScan', url: 'https://testnet.arcscan.app' }
  }
};

// USDC ABI - just the functions we need
const USDC_ABI = [
  {
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' }
    ],
    name: 'allowance',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view', type: 'function'
  },
  {
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' }
    ],
    name: 'approve',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable', type: 'function'
  },
  {
    inputs: [
      { name: 'account', type: 'address' }
    ],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view', type: 'function'
  },
  {
    inputs: [],
    name: 'decimals',
    outputs: [{ name: '', type: 'uint8' }],
    stateMutability: 'view', type: 'function'
  },
  {
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' }
    ],
    name: 'transfer',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable', type: 'function'
  }
];

// EIP-3009 transferWithAuthorization ABI
const EIP3009_ABI = [
  {
    inputs: [
      { name: 'from', type: 'address' },
      { name: 'to', type: 'address' },
      { name: 'value', type: 'uint256' },
      { name: 'validAfter', type: 'uint256' },
      { name: 'validBefore', type: 'uint256' },
      { name: 'nonce', type: 'bytes32' },
      { name: 'v', type: 'uint8' },
      { name: 'r', type: 'bytes32' },
      { name: 's', type: 'bytes32' }
    ],
    name: 'transferWithAuthorization',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      { name: 'from', type: 'address' },
      { name: 'to', type: 'address' },
      { name: 'value', type: 'uint256' },
      { name: 'validAfter', type: 'uint256' },
      { name: 'validBefore', type: 'uint256' },
      { name: 'nonce', type: 'bytes32' }
    ],
    name: 'authorizationState',
    outputs: [{ name: '', type: 'uint8' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      { name: 'authorizer', type: 'address' },
      { name: 'nonce', type: 'bytes32' }
    ],
    name: 'authorizationNonce',
    outputs: [{ name: '', type: 'bytes32' }],
    stateMutability: 'view',
    type: 'function'
  }
];

// XyloFacilitator contract ABI
const FACILITATOR_ABI = [
  {
    inputs: [
      { name: 'from', type: 'address' },
      { name: 'to', type: 'address' },
      { name: 'value', type: 'uint256' },
      { name: 'validAfter', type: 'uint256' },
      { name: 'validBefore', type: 'uint256' },
      { name: 'nonce', type: 'bytes32' },
      { name: 'v', type: 'uint8' },
      { name: 'r', type: 'bytes32' },
      { name: 's', type: 'bytes32' }
    ],
    name: 'settlePayment',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      { name: 'txHash', type: 'bytes32' }
    ],
    name: 'getSettlementStatus',
    outputs: [
      { name: 'settled', type: 'bool' },
      { name: 'from', type: 'address' },
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' },
      { name: 'fee', type: 'uint256' },
      { name: 'timestamp', type: 'uint256' }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'feeBps',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'treasury',
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'totalSettled',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'totalTransactions',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  }
];

// Contract addresses (normalized to lowercase for Arc v0.7.0+ compatibility)
const CONTRACTS = {
  USDC: (process.env.USDC_ADDRESS || '0x3600000000000000000000000000000000000000').toLowerCase(),
  EURC: (process.env.EURC_ADDRESS || '0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a').toLowerCase(),
  USYC: (process.env.USYC_ADDRESS || '0xe9185F0c5F296Ed1797AaE4238D26CCaBEadb86C').toLowerCase(),
  GATEWAY: (process.env.GATEWAY_WALLET || '0x0077777d7EBA4688BDeF3E311b846F25870A19B9').toLowerCase(),
  FACILITATOR: process.env.XYLOFACILITATOR_CONTRACT_ADDRESS?.toLowerCase() || undefined
};

// Create viem clients
const rpcUrl = process.env.ARC_RPC_URL || 'https://rpc.testnet.arc.network';

const publicClient = createPublicClient({
  chain: arcTestnet,
  transport: http(rpcUrl)
});

// Settlement wallet client
const settlementKey = process.env.SETTLEMENT_PRIVATE_KEY;
if (!settlementKey) throw new Error('SETTLEMENT_PRIVATE_KEY env var is required');
const settlementAccount = privateKeyToAccount(
  settlementKey.startsWith('0x') ? settlementKey : `0x${settlementKey}`
);

const walletClient = createWalletClient({
  account: settlementAccount,
  chain: arcTestnet,
  transport: http(rpcUrl)
});

// Treasury account
const treasuryKey = process.env.TREASURY_PRIVATE_KEY;
if (!treasuryKey) throw new Error('TREASURY_PRIVATE_KEY env var is required');
const treasuryAccount = privateKeyToAccount(
  treasuryKey.startsWith('0x') ? treasuryKey : `0x${treasuryKey}`
);

module.exports = {
  arcTestnet,
  publicClient,
  walletClient,
  settlementAccount,
  treasuryAccount,
  USDC_ABI,
  EIP3009_ABI,
  FACILITATOR_ABI,
  CONTRACTS,
  rpcUrl
};
