import { http, fallback, createConfig } from 'wagmi'
import { type Chain } from 'viem'
import {
  sepolia,
  arbitrumSepolia,
  baseSepolia,
  optimismSepolia,
  polygonAmoy,
  avalancheFuji,
  lineaSepolia,
  unichainSepolia,
  worldchainSepolia,
  inkSepolia,
  plumeSepolia,
  seiTestnet,
  xdcTestnet,
} from 'viem/chains'

// Arc Testnet Chain Definition
export const arcTestnet: Chain = {
  id: 5042002,
  name: 'Arc Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'USDC',
    symbol: 'USDC',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.testnet.arc.network'],
      webSocket: ['wss://rpc.testnet.arc.network'],
    },
    public: {
      http: ['https://rpc.testnet.arc.network'],
      webSocket: ['wss://rpc.testnet.arc.network'],
    },
  },
  blockExplorers: {
    default: { name: 'ArcScan', url: 'https://testnet.arcscan.app' },
  },
  testnet: true,
}

// Sonic Testnet (Circle CCTP V2 canonical testnet, chainId: 14601)
export const sonicTestnetCircle: Chain = {
  id: 14601,
  name: 'Sonic Testnet',
  nativeCurrency: { decimals: 18, name: 'Sonic', symbol: 'S' },
  rpcUrls: {
    default: { http: ['https://rpc.testnet.soniclabs.com'] },
  },
  blockExplorers: {
    default: { name: 'SonicScan', url: 'https://testnet.sonicscan.org' },
  },
  testnet: true,
}

// HyperEVM Testnet (chainId: 998)
export const hyperEvmTestnet: Chain = {
  id: 998,
  name: 'HyperEVM Testnet',
  nativeCurrency: { decimals: 18, name: 'HYPE', symbol: 'HYPE' },
  rpcUrls: {
    default: { http: ['https://rpc.hyperliquid-testnet.xyz/evm'] },
  },
  blockExplorers: {
    default: { name: 'Hyperliquid Explorer', url: 'https://testnet.hyperliquid.xyz/explorer' },
  },
  testnet: true,
}

// Codex Testnet (chainId: 812242)
export const codexTestnet: Chain = {
  id: 812242,
  name: 'Codex Testnet',
  nativeCurrency: { decimals: 18, name: 'Ether', symbol: 'ETH' },
  rpcUrls: {
    default: { http: ['https://rpc.open-campus-codex.gelato.digital'] },
  },
  blockExplorers: {
    default: { name: 'Codex Explorer', url: 'https://explorer.codex-stg.xyz' },
  },
  testnet: true,
}

// Explicit RPC URLs for all bridge chains
export const CHAIN_RPC_URLS: Record<number, string> = {
  [arcTestnet.id]: 'https://rpc.testnet.arc.network',
  [sepolia.id]: 'https://rpc.sepolia.org',
  [arbitrumSepolia.id]: 'https://sepolia-rollup.arbitrum.io/rpc',
  [baseSepolia.id]: 'https://sepolia.base.org',
  [optimismSepolia.id]: 'https://sepolia.optimism.io',
  [polygonAmoy.id]: 'https://rpc-amoy.polygon.technology',
  [avalancheFuji.id]: 'https://api.avax-test.network/ext/bc/C/rpc',
  [lineaSepolia.id]: 'https://rpc.sepolia.linea.build',
  [sonicTestnetCircle.id]: 'https://rpc.testnet.soniclabs.com',
  [unichainSepolia.id]: 'https://sepolia.unichain.org',
  [worldchainSepolia.id]: 'https://worldchain-sepolia.g.alchemy.com/public',
  [hyperEvmTestnet.id]: 'https://rpc.hyperliquid-testnet.xyz/evm',
  [inkSepolia.id]: 'https://ink-sepolia.g.alchemy.com/v2/demo',
  [plumeSepolia.id]: 'https://testnet-rpc.plume.org',
  [seiTestnet.id]: 'https://evm-rpc-testnet.sei-apis.com',
  [codexTestnet.id]: 'https://rpc.open-campus-codex.gelato.digital',
  [xdcTestnet.id]: 'https://erpc.apothem.network',
}

// Secondary RPCs for chains with known reliability issues
export const CHAIN_FALLBACK_RPCS: Partial<Record<number, string[]>> = {
  [arcTestnet.id]: [
    'https://testnet.imola.arct.network',
    'https://rpc.quicknode.testnet.arc.network',
    'https://rpc.drpc.testnet.arc.network',
    'https://rpc.blockdaemon.testnet.arc.network',
  ],
  [baseSepolia.id]: ['https://base-sepolia-rpc.publicnode.com'],
  [arbitrumSepolia.id]: ['https://arbitrum-sepolia-rpc.publicnode.com'],
  [sepolia.id]: ['https://ethereum-sepolia-rpc.publicnode.com'],
}

// All bridge chains - must be registered so wallet can switch to them
export const bridgeChains = [
  arcTestnet,
  sepolia,
  arbitrumSepolia,
  baseSepolia,
  optimismSepolia,
  polygonAmoy,
  avalancheFuji,
  lineaSepolia,
  sonicTestnetCircle,
  unichainSepolia,
  worldchainSepolia,
  hyperEvmTestnet,
  inkSepolia,
  plumeSepolia,
  seiTestnet,
  codexTestnet,
  xdcTestnet,
] as const

export const config = createConfig({
  chains: bridgeChains,
  transports: {
    [arcTestnet.id]: fallback([
      http(CHAIN_RPC_URLS[arcTestnet.id]),
      http('https://testnet.imola.arct.network'),
      http('https://rpc.quicknode.testnet.arc.network'),
      http('https://rpc.drpc.testnet.arc.network'),
      http('https://rpc.blockdaemon.testnet.arc.network'),
    ]),
    [sepolia.id]: fallback([
      http(CHAIN_RPC_URLS[sepolia.id]),
      http('https://ethereum-sepolia-rpc.publicnode.com'),
    ]),
    [arbitrumSepolia.id]: fallback([
      http(CHAIN_RPC_URLS[arbitrumSepolia.id]),
      http('https://arbitrum-sepolia-rpc.publicnode.com'),
    ]),
    [baseSepolia.id]: fallback([
      http(CHAIN_RPC_URLS[baseSepolia.id]),
      http('https://base-sepolia-rpc.publicnode.com'),
    ]),
    [optimismSepolia.id]: http(CHAIN_RPC_URLS[optimismSepolia.id]),
    [polygonAmoy.id]: http(CHAIN_RPC_URLS[polygonAmoy.id]),
    [avalancheFuji.id]: http(CHAIN_RPC_URLS[avalancheFuji.id]),
    [lineaSepolia.id]: http(CHAIN_RPC_URLS[lineaSepolia.id]),
    [sonicTestnetCircle.id]: http(CHAIN_RPC_URLS[sonicTestnetCircle.id]),
    [unichainSepolia.id]: http(CHAIN_RPC_URLS[unichainSepolia.id]),
    [worldchainSepolia.id]: http(CHAIN_RPC_URLS[worldchainSepolia.id]),
    [hyperEvmTestnet.id]: http(CHAIN_RPC_URLS[hyperEvmTestnet.id]),
    [inkSepolia.id]: http(CHAIN_RPC_URLS[inkSepolia.id]),
    [plumeSepolia.id]: http(CHAIN_RPC_URLS[plumeSepolia.id]),
    [seiTestnet.id]: http(CHAIN_RPC_URLS[seiTestnet.id]),
    [codexTestnet.id]: http(CHAIN_RPC_URLS[codexTestnet.id]),
    [xdcTestnet.id]: http(CHAIN_RPC_URLS[xdcTestnet.id]),
  },
  ssr: true,
})

declare module 'wagmi' {
  interface Register {
    config: typeof config
  }
}

// Build wallet_addEthereumChain params from viem chain definitions
export function getAddChainParams(chainId: number) {
  const chain = bridgeChains.find(c => c.id === chainId)
  if (!chain) return null
  return {
    chainId: '0x' + chainId.toString(16),
    chainName: chain.name,
    nativeCurrency: chain.nativeCurrency,
    rpcUrls: [CHAIN_RPC_URLS[chainId]],
    blockExplorerUrls: chain.blockExplorers?.default?.url
      ? [chain.blockExplorers.default.url]
      : undefined,
  }
}
