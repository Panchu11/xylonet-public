// Arc Network Configuration
export const ARC_TESTNET = {
  chainId: 5042002,
  name: "Arc Testnet",
  rpcUrl: "https://rpc.testnet.arc.network",
  blockExplorer: "https://testnet.arcscan.app",
  nativeCurrency: {
    name: "USDC",
    symbol: "USDC",
    decimals: 18, // Gas token uses 18 decimals
  },
};

// Real Circle USDC Configuration
export const USDC_CONFIG = {
  address: "0x3600000000000000000000000000000000000000",
  decimals: 6, // Real USDC uses 6 decimals
  symbol: "USDC",
  name: "USD Coin",
};

// Contract ABIs
export const PAYX_TIPPING_ABI = [
  // Core functions
  "function tip(string calldata handle, uint256 amount, string calldata message) external",
  "function claimTips(string calldata handle, address wallet, bytes32 nonce, bytes calldata signature) external",
  
  // View functions
  "function getPendingBalance(string calldata handle) external view returns (uint256)",
  "function getHandleInfo(string calldata handle) external view returns (tuple(uint256 pendingBalance, address linkedWallet, bool isRegistered, uint256 totalReceived, uint256 totalClaimed, uint256 tipCount))",
  "function getTipCount(string calldata handle) external view returns (uint256)",
  "function getTipHistory(string calldata handle, uint256 offset, uint256 limit) external view returns (tuple(address tipper, uint256 amount, uint256 timestamp, string message)[])",
  "function getLinkedWallet(string calldata handle) external view returns (address)",
  "function isHandleRegistered(string calldata handle) external view returns (bool)",
  "function minTipAmount() external view returns (uint256)",
  "function platformFeeBps() external view returns (uint256)",
  
  // Events
  "event TipSent(string indexed handleHash, string handle, address indexed tipper, uint256 amount, uint256 fee, string message, uint256 timestamp)",
  "event TipsClaimed(string indexed handleHash, string handle, address indexed wallet, uint256 amount, uint256 timestamp)",
  "event WalletLinked(string indexed handleHash, string handle, address indexed wallet)",
];

export const ERC20_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address owner) view returns (uint256)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function transferFrom(address from, address to, uint256 amount) returns (bool)",
  "event Transfer(address indexed from, address indexed to, uint256 value)",
  "event Approval(address indexed owner, address indexed spender, uint256 value)",
];

export const MOCK_USDC_ABI = [
  ...ERC20_ABI,
  "function mint(address to, uint256 amount) external",
  "function faucet() external",
];
