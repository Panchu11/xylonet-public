// Arc Testnet Contract Addresses
export const CONTRACTS = {
  // Stablecoins
  USDC: '0x3600000000000000000000000000000000000000' as `0x${string}`,
  EURC: '0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a' as `0x${string}`,
  USYC: '0xe9185F0c5F296Ed1797AaE4238D26CCaBEadb86C' as `0x${string}`,
  
  // CCTP
  TOKEN_MESSENGER: '0x8FE6B999Dc680CcFDD5Bf7EB0974218be2542DAA' as `0x${string}`,
  MESSAGE_TRANSMITTER: '0xE737e5cEBEEBa77EFE34D4aa090756590b1CE275' as `0x${string}`,
  
  // Gateway
  GATEWAY_WALLET: '0x0077777d7EBA4688BDeF3E311b846F25870A19B9' as `0x${string}`,
  
  // StableFX
  FX_ESCROW: '0x1f91886C7028986aD885ffCee0e40b75C9cd5aC1' as `0x${string}`,
  
  // Common
  PERMIT2: '0x000000000022D473030F116dDEE9F6B43aC78BA3' as `0x${string}`,
  MULTICALL3: '0xcA11bde05977b3631167028862bE2a173976CA11' as `0x${string}`,
  
  // XyloNet Deployed Contracts
  FACTORY: '0x60EDeFB094B84BBC6430cc130B358A43Ba1979e2' as `0x${string}`,
  ROUTER: '0x73742278c31a76dBb0D2587d03ef92E6E2141023' as `0x${string}`,
  BRIDGE: '0xf7Df65Ce418E938ee8d9a0A0d227A43441fe4641' as `0x${string}`,
  VAULT: '0x240Eb85458CD41361bd8C3773253a1D78054f747' as `0x${string}`,
  USDC_EURC_POOL: '0x3DF3966F5138143dce7a9cFDdC2c0310ce083BB1' as `0x${string}`,
  USDC_USYC_POOL: '0x8296cC7477A9CD12cF632042fDDc2aB89151bb61' as `0x${string}`,
} as const

// Token information
export const TOKENS = {
  USDC: {
    address: CONTRACTS.USDC,
    symbol: 'USDC',
    name: 'USD Coin',
    decimals: 6,
    logo: '/tokens/usdc.svg',
  },
  EURC: {
    address: CONTRACTS.EURC,
    symbol: 'EURC',
    name: 'Euro Coin',
    decimals: 6,
    logo: '/tokens/eurc.svg',
  },
  USYC: {
    address: CONTRACTS.USYC,
    symbol: 'USYC',
    name: 'US Yield Coin',
    decimals: 6,
    logo: '/tokens/usyc.svg',
  },
} as const

// Chain information for bridge
export const SUPPORTED_CHAINS = [
  { id: 1, name: 'Ethereum', domain: 0, logo: '/chains/ethereum.svg' },
  { id: 42161, name: 'Arbitrum', domain: 3, logo: '/chains/arbitrum.svg' },
  { id: 8453, name: 'Base', domain: 6, logo: '/chains/base.svg' },
  { id: 10, name: 'Optimism', domain: 2, logo: '/chains/optimism.svg' },
  { id: 137, name: 'Polygon', domain: 7, logo: '/chains/polygon.svg' },
  { id: 5042002, name: 'Arc Testnet', domain: 26, logo: '/chains/arc.svg' },
] as const

// Arc Network Info
export const ARC_NETWORK = {
  chainId: 5042002,
  name: 'Arc Testnet',
  rpcUrl: 'https://rpc.testnet.arc.network',
  wsUrl: 'wss://rpc.testnet.arc.network',
  explorer: 'https://testnet.arcscan.app',
  faucet: 'https://faucet.circle.com',
} as const

// Note: USDC addresses per chain are now managed automatically by Circle App Kit.
// No manual CHAIN_USDC_ADDRESSES or CCTP_DOMAINS needed.
