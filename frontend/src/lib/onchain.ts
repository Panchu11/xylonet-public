// On-chain RPC helpers for XyloNet analytics
// Fetches live pool reserves and fee parameters from Arc Testnet.
// Runs server-side only (Next.js server component / API route).

import { ethers } from 'ethers';

const ARC_RPC_URL =
  process.env.NEXT_PUBLIC_ARC_RPC_URL ||
  process.env.ARC_RPC_URL ||
  'https://rpc.testnet.arc.network';

// Minimal XyloPool ABI — only the view functions we need.
const POOL_ABI = [
  'function getPoolInfo() view returns (address token0, address token1, uint256 reserve0, uint256 reserve1, uint256 amplificationParameter, uint256 swapFee, uint256 totalSupply)',
  'function getReserves() view returns (uint256 reserve0, uint256 reserve1)',
];

const ERC20_ABI = ['function decimals() view returns (uint8)'];

// Minimal XyloVault ABI — only the view functions we need.
const VAULT_ABI = [
  'function totalAssets() view returns (uint256)',
];

/** USDC has 6 decimals on all supported chains. */
const USDC_DECIMALS = 6;

const provider = new ethers.JsonRpcProvider(ARC_RPC_URL);

interface PoolInfo {
  token0: string;
  token1: string;
  reserve0: bigint;
  reserve1: bigint;
  amplificationParameter: bigint;
  swapFee: bigint;
  totalSupply: bigint;
}

export interface PoolOnChainInfo {
  /** Total pool liquidity in USD (both tokens treated as $1). */
  liquidity: number;
  /** Swap fee in basis points, e.g. 4 = 0.04%. */
  swapFeeBps: number;
}

const decimalsCache = new Map<string, number>();

async function getTokenDecimals(tokenAddress: string): Promise<number> {
  const cached = decimalsCache.get(tokenAddress);
  if (cached !== undefined) return cached;

  try {
    const contract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
    const decimals = Number(await contract.decimals());
    decimalsCache.set(tokenAddress, decimals);
    return decimals;
  } catch (error) {
    console.warn(
      `[OnChain] Failed to fetch decimals for ${tokenAddress}, defaulting to 6:`,
      error,
    );
    decimalsCache.set(tokenAddress, 6);
    return 6;
  }
}

function toUsd(raw: bigint, decimals: number): number {
  const n = Number(raw);
  if (!Number.isFinite(n)) return 0;
  return n / 10 ** decimals;
}

async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error(`RPC call timed out after ${ms}ms`)), ms),
  );
  return Promise.race([promise, timeout]);
}

export async function fetchPoolInfo(
  poolAddress: string,
): Promise<PoolOnChainInfo | null> {
  try {
    if (!ethers.isAddress(poolAddress)) {
      console.warn(`[OnChain] Invalid pool address: ${poolAddress}`);
      return null;
    }

    const pool = new ethers.Contract(poolAddress, POOL_ABI, provider);
    const info: PoolInfo = await withTimeout(pool.getPoolInfo(), 15_000);

    const [decimals0, decimals1] = await Promise.all([
      getTokenDecimals(info.token0),
      getTokenDecimals(info.token1),
    ]);

    const liquidity =
      toUsd(info.reserve0, decimals0) + toUsd(info.reserve1, decimals1);

    return {
      liquidity,
      swapFeeBps: Number(info.swapFee),
    };
  } catch (error) {
    console.error(
      `[OnChain] Failed to fetch pool info for ${poolAddress}:`,
      error,
    );
    return null;
  }
}

export async function fetchPoolLiquidity(poolAddress: string): Promise<number> {
  const info = await fetchPoolInfo(poolAddress);
  return info?.liquidity ?? 0;
}

export async function fetchAllPoolInfo(
  pools: Array<{ address: string }>,
): Promise<Map<string, PoolOnChainInfo>> {
  const results = await Promise.allSettled(
    pools.map(async (p) => {
      const info = await fetchPoolInfo(p.address);
      return {
        address: p.address,
        info: info ?? { liquidity: 0, swapFeeBps: 0 },
      };
    }),
  );

  const map = new Map<string, PoolOnChainInfo>();
  for (const result of results) {
    if (result.status === 'fulfilled') {
      map.set(result.value.address.toLowerCase(), result.value.info);
    }
  }
  return map;
}

export async function fetchAllPoolLiquidity(
  pools: Array<{ address: string }>,
): Promise<Map<string, number>> {
  const infoMap = await fetchAllPoolInfo(pools);
  const liquidityMap = new Map<string, number>();
  infoMap.forEach((info, address) => {
    liquidityMap.set(address, info.liquidity);
  });
  return liquidityMap;
}

/**
 * Fetch the XyloVault's current on-chain TVL by calling totalAssets().
 * Returns the actual vault balance in USD (USDC has 6 decimals).
 * Falls back to 0 on error so the caller can use a fallback calculation.
 */
export async function fetchVaultTVL(vaultAddress: string): Promise<number> {
  try {
    if (!ethers.isAddress(vaultAddress)) {
      console.warn(`[OnChain] Invalid vault address: ${vaultAddress}`);
      return 0;
    }

    const vault = new ethers.Contract(vaultAddress, VAULT_ABI, provider);
    const totalAssets = await withTimeout(vault.totalAssets(), 15_000);

    const n = Number(totalAssets);
    if (!Number.isFinite(n)) return 0;
    return n / 10 ** USDC_DECIMALS;
  } catch (error) {
    console.error(
      `[OnChain] Failed to fetch vault TVL for ${vaultAddress}:`,
      error,
    );
    return 0;
  }
}
