export const PayXTippingABI = [
  // ═══════════════════════════════════════════════════════════════════════
  // EVENTS - For fetching historical tip data
  // ═══════════════════════════════════════════════════════════════════════
  // TipSent event - IMPORTANT: handleHash is indexed STRING (not bytes32)
  // Event signature: TipSent(string,string,address,uint256,uint256,string,uint256)
  // Hash: 0x531a63334fe69fa9f4697e7cf8d0683d1bef9243a4c7a1046c8f95dede07680f
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "string", "name": "handleHash", "type": "string" },
      { "indexed": false, "internalType": "string", "name": "handle", "type": "string" },
      { "indexed": true, "internalType": "address", "name": "tipper", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" },
      { "indexed": false, "internalType": "uint256", "name": "fee", "type": "uint256" },
      { "indexed": false, "internalType": "string", "name": "message", "type": "string" },
      { "indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256" }
    ],
    "name": "TipSent",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "string", "name": "handleHash", "type": "string" },
      { "indexed": false, "internalType": "string", "name": "handle", "type": "string" },
      { "indexed": true, "internalType": "address", "name": "wallet", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" },
      { "indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256" }
    ],
    "name": "TipsClaimed",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "string", "name": "handleHash", "type": "string" },
      { "indexed": false, "internalType": "string", "name": "handle", "type": "string" },
      { "indexed": true, "internalType": "address", "name": "wallet", "type": "address" }
    ],
    "name": "WalletLinked",
    "type": "event"
  },

  // ═══════════════════════════════════════════════════════════════════════
  // FUNCTIONS - For contract interactions
  // ═══════════════════════════════════════════════════════════════════════
  {
    "inputs": [
      { "internalType": "string", "name": "handle", "type": "string" },
      { "internalType": "uint256", "name": "amount", "type": "uint256" },
      { "internalType": "string", "name": "message", "type": "string" }
    ],
    "name": "tip",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "string", "name": "handle", "type": "string" },
      { "internalType": "address", "name": "wallet", "type": "address" },
      { "internalType": "bytes32", "name": "nonce", "type": "bytes32" },
      { "internalType": "bytes", "name": "signature", "type": "bytes" }
    ],
    "name": "claimTips",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "string", "name": "handle", "type": "string" }
    ],
    "name": "getPendingBalance",
    "outputs": [
      { "internalType": "uint256", "name": "", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "string", "name": "handle", "type": "string" }
    ],
    "name": "getHandleInfo",
    "outputs": [
      {
        "components": [
          { "internalType": "uint256", "name": "pendingBalance", "type": "uint256" },
          { "internalType": "address", "name": "linkedWallet", "type": "address" },
          { "internalType": "bool", "name": "isRegistered", "type": "bool" },
          { "internalType": "uint256", "name": "totalReceived", "type": "uint256" },
          { "internalType": "uint256", "name": "totalClaimed", "type": "uint256" },
          { "internalType": "uint256", "name": "tipCount", "type": "uint256" }
        ],
        "internalType": "struct PayXTipping.HandleInfo",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "string", "name": "handle", "type": "string" },
      { "internalType": "uint256", "name": "offset", "type": "uint256" },
      { "internalType": "uint256", "name": "limit", "type": "uint256" }
    ],
    "name": "getTipHistory",
    "outputs": [
      {
        "components": [
          { "internalType": "address", "name": "tipper", "type": "address" },
          { "internalType": "uint256", "name": "amount", "type": "uint256" },
          { "internalType": "uint256", "name": "timestamp", "type": "uint256" },
          { "internalType": "string", "name": "message", "type": "string" }
        ],
        "internalType": "struct PayXTipping.Tip[]",
        "name": "tips",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalFeesCollected",
    "outputs": [
      { "internalType": "uint256", "name": "", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "platformFeeBps",
    "outputs": [
      { "internalType": "uint256", "name": "", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "minTipAmount",
    "outputs": [
      { "internalType": "uint256", "name": "", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

// PayX Contract deployed with Real Circle USDC
export const PAYX_CONTRACT_ADDRESS = '0xA312c384770B7b49E371DF4b7AF730EFEF465913' as const;

// Real Circle USDC address (6 decimals)
export const PAYX_USDC_ADDRESS = '0x3600000000000000000000000000000000000000' as const;
export const PAYX_USDC_DECIMALS = 6;

// Contract deployment block (for efficient event fetching)
// Deployed on 2026-01-09 at block ~20843000
export const PAYX_DEPLOYMENT_BLOCK = 20843000;
