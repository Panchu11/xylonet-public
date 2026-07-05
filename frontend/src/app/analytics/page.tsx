import {
  fetchPools,
  fetchRecentSwaps,
  fetchTipLeaderboard,
  fetchDailyVolumes,
  fetchPoolDailyVolumes,
  fetchProtocolOverview,
  fetchProtocolStats,
  fetchTips,
  fetchVaultEvents,
  fetchTopTraders,
  fetchIndexerStatus,
  type Pool,
  type Swap,
  type Tip,
  type VaultEvent,
  type DailyVolume,
  type PoolDailyVolume,
  type ProtocolOverview,
  type ProtocolStatsData,
} from '@/lib/envio';
import {
  fetchAllPoolInfo,
  fetchVaultTVL,
  type PoolOnChainInfo,
} from '@/lib/onchain';
import { CONTRACTS, ARC_NETWORK } from '@/config/constants';
import { OverviewCards } from '@/components/analytics/OverviewCards';
import { MainChart } from '@/components/analytics/MainChart';
import { BridgeChart } from '@/components/analytics/BridgeChart';
import { PoolsTable } from '@/components/analytics/PoolsTable';
import { PayXStats } from '@/components/analytics/PayXStats';
import { VaultMetrics } from '@/components/analytics/VaultMetrics';
import { ProtocolMetrics } from '@/components/analytics/ProtocolMetrics';
import { ActivityFeed, type ActivityItem } from '@/components/analytics/ActivityFeed';
import { TopTraders } from '@/components/analytics/TopTraders';
import { fetchBridgeAnalytics } from '@/lib/bridge-analytics';
import { BarChart3 } from 'lucide-react';

export const revalidate = 60; // ISR: revalidate every 60 seconds

// ------------------------------------------------------------------
// Types used to map Envio entities → component prop shapes
// (kept structurally identical to what each component expects)
// ------------------------------------------------------------------

interface PoolData {
  name: string;
  liquidity: number;
  volume24h: number;
  volume7d: number;
  feeApr: number;
}

interface VaultDataPoint {
  date: string;
  tvl: number;
  deposits?: number;
  withdrawals?: number;
}

interface DailyChartData {
  date: string;
  swap_volume: number;
  bridge_volume: number;
  tip_volume: number;
  /** Total transactions that day (swaps + tips + vault events) */
  transactions: number;
  /** Cumulative vault net deposits as of that day */
  vault_net: number;
}

interface AnalyticsData {
  pools: PoolData[];
  vault: VaultDataPoint[];
  vaultTVL: number;
  poolTVL: number;
  totalTVL: number;
  vaultAPY?: number;
  dailyChart: DailyChartData[];
  dailyVolumes: DailyVolume[];
  recentSwaps: Swap[];
  totalUsers: number;
  totalTips: number;
  tipsVolume: number;
  totalSwapVolume: number;
  totalSwaps: number;
  volume24h: number;
  /** % change of the rolling 24h volume vs. the previous 24h window */
  volumeChangePct?: number;
  tips24h: number;
  tipsVolume24h: number;
  swaps24h: number;
  feeRevenue: number;
  timestamp: string;
}

// ------------------------------------------------------------------
// Helpers
// ------------------------------------------------------------------

const SECONDS_PER_DAY = 86_400;
const USDC_DECIMALS = 6;

/** Convert a raw BigInt string (6-decimal USDC amounts) to a JS number. */
function toTokenAmount(raw: string, decimals = USDC_DECIMALS): number {
  const n = Number(raw);
  if (!Number.isFinite(n)) return 0;
  return n / 10 ** decimals;
}

/** Friendly pool name lookup by address. */
const POOL_NAME_MAP: Record<string, string> = {
  '0x3DF3966F5138143dce7a9cFDdC2c0310ce083BB1': 'USDC / EURC',
  '0x8296cC7477A9CD12cF632042fDDc2aB89151bb61': 'USDC / USYC',
};

function poolName(address: string): string {
  const matched = POOL_NAME_MAP[address];
  if (matched) return matched;
  if (address.length <= 12) return address;
  return `${address.slice(0, 8)}…${address.slice(-4)}`;
}

// ------------------------------------------------------------------
// Data fetching (Envio GraphQL via @/lib/envio)
// ------------------------------------------------------------------

async function fetchAnalyticsData(): Promise<AnalyticsData> {
  const now = Math.floor(Date.now() / 1000);

  const logQueryError = (query: string, error: unknown) => {
    console.error(
      JSON.stringify({
        source: '[Analytics]',
        query,
        status: 'failed',
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
      }),
    );
  };

  // Phase 1: Quick single-request queries (run in parallel).
  // Each query is isolated so a single failure doesn't blank the whole page.
  // fetchProtocolStats is the preferred zero-pagination source for headline metrics.
  const [
    poolsResult,
    recentSwapsResult,
    dailyVolumesResult,
    poolDailyVolumesResult,
    protocolStatsResult,
  ] = await Promise.allSettled([
    fetchPools(),
    // Sample of the most recent swaps — used ONLY to estimate each pool's
    // share of volume when PoolDailyVolume is unavailable. Never summed
    // directly as a "24h volume": at >100k swaps/day a 500-row sample covers
    // minutes, not hours (this was the source of the ~1000× undercount).
    fetchRecentSwaps(500),
    fetchDailyVolumes(1000), // ~176 daily records, fetches all history
    fetchPoolDailyVolumes(8), // per-pool daily aggregates (exact 24h/7d)
    fetchProtocolStats(), // singleton aggregate row — single fast query
  ]);

  const pools: Pool[] =
    poolsResult.status === 'fulfilled' ? poolsResult.value : [];
  if (poolsResult.status === 'rejected') {
    logQueryError('fetchPools', poolsResult.reason);
  }

  // Fetch live on-chain pool reserves + swap fees (depends on pool list) and
  // the vault's current on-chain balance (independent of pool list) in parallel.
  let poolInfoMap = new Map<string, PoolOnChainInfo>();
  let onChainVaultTVL = 0;

  const [poolInfoResult, vaultTVLResult] = await Promise.allSettled([
    fetchAllPoolInfo(pools),
    fetchVaultTVL(CONTRACTS.VAULT),
  ]);

  if (poolInfoResult.status === 'fulfilled') {
    poolInfoMap = poolInfoResult.value;
  } else {
    logQueryError('fetchAllPoolInfo', poolInfoResult.reason);
  }

  if (vaultTVLResult.status === 'fulfilled') {
    onChainVaultTVL = vaultTVLResult.value;
  } else {
    logQueryError('fetchVaultTVL', vaultTVLResult.reason);
  }

  const recentSwaps: Swap[] =
    recentSwapsResult.status === 'fulfilled' ? recentSwapsResult.value : [];
  if (recentSwapsResult.status === 'rejected') {
    logQueryError('fetchRecentSwaps', recentSwapsResult.reason);
  }

  const dailyVolumes: DailyVolume[] =
    dailyVolumesResult.status === 'fulfilled' ? dailyVolumesResult.value : [];
  if (dailyVolumesResult.status === 'rejected') {
    logQueryError('fetchDailyVolumes', dailyVolumesResult.reason);
  }

  const poolDailyVolumes: PoolDailyVolume[] =
    poolDailyVolumesResult.status === 'fulfilled'
      ? poolDailyVolumesResult.value
      : [];
  if (poolDailyVolumesResult.status === 'rejected') {
    logQueryError('fetchPoolDailyVolumes', poolDailyVolumesResult.reason);
  }

  const protocolStats: ProtocolStatsData | null =
    protocolStatsResult.status === 'fulfilled'
      ? protocolStatsResult.value
      : null;
  if (protocolStatsResult.status === 'rejected') {
    logQueryError('fetchProtocolStats', protocolStatsResult.reason);
  }

  // Phase 2: Expensive paginated fallback — only needed when ProtocolStats
  // (the fast singleton aggregate) is unavailable. When ProtocolStats returns
  // data we skip fetchProtocolOverview entirely, avoiding the expensive
  // fetchProtocolUserCount / fetchTipTotals pagination loops.
  let overview: ProtocolOverview | null = null;
  if (!protocolStats) {
    try {
      overview = await fetchProtocolOverview();
    } catch (error) {
      logQueryError('fetchProtocolOverview', error);
    }
  }

  // ---- Rolling 24h aggregates from DailyVolume (authoritative) ----
  // The protocol sees >100k swaps/day, so summing a fixed-size sample of
  // recent events massively undercounts. Instead, approximate a rolling 24h
  // window from daily UTC aggregates: today's full day plus the fraction of
  // yesterday still inside the window. Exact at UTC midnight, and never off
  // by more than intra-day skew — vs. ~1000× off with the sample approach.
  const todayISO = new Date(now * 1000).toISOString().split('T')[0];
  const yesterdayISO = new Date((now - SECONDS_PER_DAY) * 1000)
    .toISOString()
    .split('T')[0];
  const yesterdayFraction = 1 - (now % SECONDS_PER_DAY) / SECONDS_PER_DAY;

  const todayRow = dailyVolumes.find((d) => d.date === todayISO);
  const yesterdayRow = dailyVolumes.find((d) => d.date === yesterdayISO);
  const rolling24h = (selector: (d: DailyVolume) => number): number =>
    (todayRow ? selector(todayRow) : 0) +
    (yesterdayRow ? selector(yesterdayRow) : 0) * yesterdayFraction;

  const swapVolume24h = rolling24h((d) => toTokenAmount(d.swapVolume));
  const swaps24h = Math.round(rolling24h((d) => Number(d.swapCount)));
  const tipsVolume24h = rolling24h((d) => toTokenAmount(d.tipVolume));
  const tips24h = Math.round(rolling24h((d) => Number(d.tipCount)));

  // Previous rolling 24h window [now-48h, now-24h] under the same uniform-rate
  // approximation: the head (1 − f) of yesterday plus the tail f of the day
  // before. Used only for the headline volume delta.
  const dayBeforeISO = new Date((now - 2 * SECONDS_PER_DAY) * 1000)
    .toISOString()
    .split('T')[0];
  const dayBeforeRow = dailyVolumes.find((d) => d.date === dayBeforeISO);
  const prevWindow = (selector: (d: DailyVolume) => number): number =>
    (yesterdayRow ? selector(yesterdayRow) : 0) * (1 - yesterdayFraction) +
    (dayBeforeRow ? selector(dayBeforeRow) : 0) * yesterdayFraction;

  const prevVolume24h =
    prevWindow((d) => toTokenAmount(d.swapVolume)) +
    prevWindow((d) => toTokenAmount(d.tipVolume));

  // Global 7d swap volume (last 7 UTC days incl. today) — also used to
  // apportion pool volumes in the fallback path below.
  const sevenDayCutoffISO = new Date((now - 7 * SECONDS_PER_DAY) * 1000)
    .toISOString()
    .split('T')[0];
  const volume7dGlobal = dailyVolumes
    .filter((d) => d.date > sevenDayCutoffISO)
    .reduce((sum, d) => sum + toTokenAmount(d.swapVolume), 0);

  // ---- Per-pool 24h / 7d volumes ----
  // Preferred: PoolDailyVolume aggregates (exact, added to the indexer).
  // Fallback (indexer not redeployed yet): apportion the global rolling
  // volumes by each pool's share of the recent-swap sample. The sample is a
  // biased total but a reasonable share estimator.
  const poolDailyByPool = new Map<string, PoolDailyVolume[]>();
  for (const pd of poolDailyVolumes) {
    const key = pd.pool.toLowerCase();
    const list = poolDailyByPool.get(key) ?? [];
    list.push(pd);
    poolDailyByPool.set(key, list);
  }

  const sampleByPool = new Map<string, number>();
  let sampleTotal = 0;
  for (const s of recentSwaps) {
    const key = s.pool.toLowerCase();
    const amt = toTokenAmount(s.amountIn);
    sampleByPool.set(key, (sampleByPool.get(key) ?? 0) + amt);
    sampleTotal += amt;
  }

  // ---- Pools (PoolsTable expects: name, liquidity, volume24h, volume7d, feeApr) ----
  const poolData: PoolData[] = pools.map((p) => {
    const key = p.address.toLowerCase();
    const dailyRows = poolDailyByPool.get(key) ?? [];

    let volume24h: number;
    let volume7d: number;
    if (dailyRows.length > 0) {
      const t = dailyRows.find((r) => r.date === todayISO);
      const y = dailyRows.find((r) => r.date === yesterdayISO);
      volume24h =
        (t ? toTokenAmount(t.volume) : 0) +
        (y ? toTokenAmount(y.volume) : 0) * yesterdayFraction;
      volume7d = dailyRows
        .filter((r) => r.date > sevenDayCutoffISO)
        .reduce((sum, r) => sum + toTokenAmount(r.volume), 0);
    } else {
      const share =
        sampleTotal > 0 ? (sampleByPool.get(key) ?? 0) / sampleTotal : 0;
      volume24h = swapVolume24h * share;
      volume7d = volume7dGlobal * share;
    }

    const onChain = poolInfoMap.get(key);
    const liquidity = onChain?.liquidity ?? 0;
    const swapFeeBps = onChain?.swapFeeBps ?? 0;

    // APR = (annualized daily fees / liquidity) * 100
    // Daily fees are approximated as 24h volume * swap fee (in bps).
    const dailyFees = volume24h * (swapFeeBps / 10000);
    const annualizedFees = dailyFees * 365;
    const feeApr =
      liquidity > 0 ? (annualizedFees / liquidity) * 100 : 0;

    return {
      name: poolName(p.address),
      liquidity,
      volume24h,
      volume7d,
      feeApr,
    };
  });

  // ---- Vault series (VaultMetrics) ----
  // Build running TVL from DailyVolume records (covers full history, no event-fetch limit).
  // DailyVolume is sorted desc; reverse to walk chronologically.
  const sortedDaily = [...dailyVolumes].sort((a, b) =>
    a.date < b.date ? -1 : 1,
  );

  let runningTVL = 0;
  const vaultByDate: Record<
    string,
    { date: string; tvl: number; deposits: number; withdrawals: number }
  > = {};

  for (const d of sortedDaily) {
    const deposits = toTokenAmount(d.vaultDeposits);
    const withdrawals = toTokenAmount(d.vaultWithdrawals);
    runningTVL = runningTVL + deposits - withdrawals;
    vaultByDate[d.date] = {
      date: d.date,
      tvl: Math.max(runningTVL, 0),
      deposits,
      withdrawals,
    };
  }

  // Show all available vault history (not just last 30 days)
  const vaultSeries: VaultDataPoint[] = Object.values(vaultByDate);

  // Pool liquidity from on-chain reserves (already computed above).
  const poolTVL = poolData.reduce((sum, p) => sum + p.liquidity, 0);

  // Vault TVL: prefer on-chain totalAssets() (actual balance), fall back to
  // ProtocolStats deposits − withdrawals, then to DailyVolume running total.
  const latestVaultEntry = vaultSeries[vaultSeries.length - 1];
  const fallbackVaultTVL = protocolStats
    ? (Number(protocolStats.totalVaultDeposits) -
        Number(protocolStats.totalVaultWithdrawals)) /
      10 ** USDC_DECIMALS
    : overview
      ? Number(overview.totalTVL) / 10 ** USDC_DECIMALS
      : (latestVaultEntry?.tvl ?? 0);

  const vaultTVL = onChainVaultTVL > 0 ? onChainVaultTVL : fallbackVaultTVL;

  // Headline TVL = vault balance + pool reserves.
  const totalTVL = vaultTVL + poolTVL;

  // Total tips volume fallback — summed from DailyVolume when ProtocolStats
  // and overview are both unavailable.
  const allTimeTipVolume = dailyVolumes.reduce(
    (sum, d) => sum + toTokenAmount(d.tipVolume),
    0,
  );

  // ---- Fee revenue: prefer ProtocolStats, fall back to overview ----
  const feeRevenue = protocolStats
    ? Number(protocolStats.totalFeeRevenue) / 10 ** USDC_DECIMALS
    : overview
      ? Number(overview.feeRevenue) / 10 ** USDC_DECIMALS
      : 0;

  // ---- Daily chart (MainChart expects ascending daily series) ----
  const dailyChart: DailyChartData[] = dailyVolumes
    .map((d) => ({
      date: d.date,
      swap_volume: toTokenAmount(d.swapVolume),
      // Bridges aren't indexed by Envio; the page component merges the
      // per-day Supabase bridge volumes into this series.
      bridge_volume: 0,
      tip_volume: toTokenAmount(d.tipVolume),
      transactions:
        Number(d.swapCount) +
        Number(d.tipCount) +
        Number(d.depositCount) +
        Number(d.withdrawCount),
      // Cumulative net deposits, computed in vaultByDate above (same source).
      vault_net: vaultByDate[d.date]?.tvl ?? 0,
    }))
    .reverse(); // DailyVolume comes newest-first; chart expects ascending

  // ---- Aggregate 24h total volume ----
  const volume24h = Math.round(swapVolume24h + tipsVolume24h);

  // totalTips: prefer ProtocolStats, fall back to overview, then DailyVolume sums.
  const totalTips = protocolStats
    ? Number(protocolStats.totalTips)
    : overview?.tipCount
      ? overview.tipCount
      : dailyVolumes.reduce((sum, d) => sum + Number(d.tipCount), 0);

  // All-time swap volume: prefer ProtocolStats, fall back to Pool totals.
  const totalSwapVolume = protocolStats
    ? Number(protocolStats.totalSwapVolume) / 10 ** USDC_DECIMALS
    : (pools.reduce((acc, p) => acc + Number(p.totalVolume), 0) /
        10 ** USDC_DECIMALS);

  // All-time swap count: prefer ProtocolStats, fall back to Pool txCount totals.
  const totalSwaps = protocolStats
    ? Number(protocolStats.totalSwaps)
    : pools.reduce((acc, p) => acc + Number(p.txCount), 0);

  // Circuit breaker: if every core Envio source failed in this pass, don't
  // render a "successful" page full of zeros — throw so ISR keeps serving
  // the last known-good cached page instead of overwriting it with blank data.
  if (!protocolStats && !overview && pools.length === 0 && dailyVolumes.length === 0) {
    throw new Error('[Analytics] All Envio queries failed — aborting to preserve cached data');
  }

  return {
    pools: poolData,
    vault: vaultSeries,
    vaultTVL: Math.round(vaultTVL),
    poolTVL: Math.round(poolTVL),
    totalTVL: Math.round(totalTVL),
    vaultAPY: undefined,
    dailyChart,
    // Expose dailyVolumes so the page can compute rolling windows without
    // refetching from Envio.
    dailyVolumes,
    // Expose the recent-swap sample for the activity feed (already fetched).
    recentSwaps,
    // Headline metrics prefer ProtocolStats (zero-pagination). The paginated
    // overview is only used as a fallback when ProtocolStats is unavailable.
    totalUsers: protocolStats
      ? Number(protocolStats.totalUsers)
      : overview?.userCount ?? 0,
    totalTips,
    tipsVolume: Math.round(
      protocolStats
        ? Number(protocolStats.totalTipVolume) / 10 ** USDC_DECIMALS
        : allTimeTipVolume,
    ),
    totalSwapVolume: Math.round(totalSwapVolume),
    totalSwaps,
    volume24h,
    volumeChangePct:
      prevVolume24h > 0
        ? ((volume24h - prevVolume24h) / prevVolume24h) * 100
        : undefined,
    tips24h,
    tipsVolume24h,
    swaps24h,
    feeRevenue: Math.round(feeRevenue),
    timestamp: new Date().toISOString(),
  };
}

async function fetchTopTippers(): Promise<
  Array<{ address: string; amount: number }>
> {
  try {
    const leaderboard = await fetchTipLeaderboard(5);
    return leaderboard.map((entry) => ({
      address: entry.tipper,
      amount: Number(entry.totalAmount) / 10 ** USDC_DECIMALS,
    }));
  } catch (error) {
    console.error('[Analytics] Failed to fetch tip leaderboard from Envio:', error);
    return [];
  }
}

// ------------------------------------------------------------------
// Activity feed helpers
// ------------------------------------------------------------------

const TOKEN_SYMBOLS: Record<string, string> = {
  [CONTRACTS.USDC.toLowerCase()]: 'USDC',
  [CONTRACTS.EURC.toLowerCase()]: 'EURC',
  [CONTRACTS.USYC.toLowerCase()]: 'USYC',
};

function tokenSymbol(address: string): string {
  return TOKEN_SYMBOLS[address.toLowerCase()] ?? `${address.slice(0, 6)}…`;
}

function formatFeedUSD(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${value.toLocaleString('en-US', { maximumFractionDigits: 2 })}`;
}

/** Merge recent swaps, tips, and vault events into one feed, newest first. */
function buildActivityItems(
  swaps: Swap[],
  tips: Tip[],
  vaultEvents: VaultEvent[],
): ActivityItem[] {
  const items: ActivityItem[] = [
    ...swaps.slice(0, 10).map((s) => ({
      id: s.id,
      type: 'swap' as const,
      txHash: s.txHash,
      timestamp: Number(s.timestamp),
      title: `${formatFeedUSD(toTokenAmount(s.amountIn))} ${tokenSymbol(s.tokenIn)} → ${tokenSymbol(s.tokenOut)}`,
    })),
    ...tips.slice(0, 10).map((t) => ({
      id: t.id,
      type: 'tip' as const,
      txHash: t.txHash,
      timestamp: Number(t.timestamp),
      title: `${formatFeedUSD(toTokenAmount(t.amount))} tip to @${t.handle}`,
    })),
    ...vaultEvents.slice(0, 10).map((v) => ({
      id: v.id,
      type: v.eventType.toLowerCase().includes('deposit')
        ? ('deposit' as const)
        : ('withdraw' as const),
      txHash: v.txHash,
      timestamp: Number(v.timestamp),
      title: `${formatFeedUSD(toTokenAmount(v.assets))} vault ${
        v.eventType.toLowerCase().includes('deposit') ? 'deposit' : 'withdrawal'
      }`,
    })),
  ];

  return items.sort((a, b) => b.timestamp - a.timestamp).slice(0, 12);
}

/** Short USD formatter for the TVL breakdown subtitle. */
function formatShortUSD(value: number): string {
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(2)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  return `$${Math.round(value)}`;
}

// ------------------------------------------------------------------
// Page component
// ------------------------------------------------------------------

export default async function AnalyticsPage() {
  // Load analytics data first; expensive paginated counts are throttled + cached.
  const data = await fetchAnalyticsData();
  // Top tippers now fetches a single limited page ordered by amount, so it is
  // cheap enough to run after the overview data without risking rate limits.
  const topTippers = await fetchTopTippers();

  // Bridge analytics come from Supabase (Circle App Kit / LI.FI bridges,
  // not XyloNet contracts). Errors are handled inside the fetcher and
  // return an empty result so a Supabase outage won't break the page.
  // The remaining queries are small single-page fetches for the activity
  // feed, trader leaderboard, and the indexer sync badge — all optional,
  // so failures degrade to empty sections rather than breaking the page.
  const [
    bridgeAnalyticsResult,
    recentTipsResult,
    recentVaultEventsResult,
    topTradersResult,
    indexerStatusResult,
  ] = await Promise.allSettled([
    fetchBridgeAnalytics(30),
    fetchTips(10),
    fetchVaultEvents(10),
    // Over-fetch so the leaderboard still has 5 rows after filtering out
    // protocol contracts (the router is recorded as sender for routed swaps).
    fetchTopTraders(12),
    fetchIndexerStatus(),
  ]);

  const bridgeAnalytics =
    bridgeAnalyticsResult.status === 'fulfilled'
      ? bridgeAnalyticsResult.value
      : {
          chainData: [],
          totalVolume: 0,
          totalCount: 0,
          volume24h: 0,
          dailyVolumes: [],
        };
  const recentTips =
    recentTipsResult.status === 'fulfilled' ? recentTipsResult.value : [];
  const recentVaultEvents =
    recentVaultEventsResult.status === 'fulfilled'
      ? recentVaultEventsResult.value
      : [];
  // Exclude protocol-owned addresses — the router is the recorded sender for
  // routed swaps and would otherwise sit at #1 with the protocol's own volume.
  const protocolAddresses = new Set(
    Object.values(CONTRACTS).map((a) => a.toLowerCase()),
  );
  const topTraders = (
    topTradersResult.status === 'fulfilled' ? topTradersResult.value : []
  )
    .filter((t) => !protocolAddresses.has(t.address.toLowerCase()))
    .slice(0, 5);
  const indexerStatus =
    indexerStatusResult.status === 'fulfilled' ? indexerStatusResult.value : null;

  const activityItems = buildActivityItems(
    data.recentSwaps,
    recentTips,
    recentVaultEvents,
  );
  const renderedAt = Math.floor(new Date(data.timestamp).getTime() / 1000);

  // Headline TVL = on-chain vault balance + pool reserves.
  const tvl = data.totalTVL;
  const volume24h = data.volume24h;
  const totalUsers = data.totalUsers;
  const feeRevenue = data.feeRevenue;

  // Rolling swap-volume windows from daily aggregates.
  const sortedDailyVolumes = [...data.dailyVolumes].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );
  const volume7d = sortedDailyVolumes
    .slice(-7)
    .reduce((sum, d) => sum + toTokenAmount(d.swapVolume), 0);
  const volume30d = sortedDailyVolumes
    .slice(-30)
    .reduce((sum, d) => sum + toTokenAmount(d.swapVolume), 0);

  // 24h transaction count — rolling window computed in fetchAnalyticsData
  // with the same method as the 24h volume, so the two cards agree.
  const swaps24h = data.swaps24h;

  // Merge per-day bridge volumes (Supabase) into the Envio daily series so
  // the volume chart includes bridge activity instead of a hardcoded 0.
  const bridgeByDate = new Map(
    bridgeAnalytics.dailyVolumes.map((b) => [b.date, b.volume]),
  );
  const dailyChart = data.dailyChart.map((d) => ({
    ...d,
    bridge_volume: bridgeByDate.get(d.date) ?? 0,
  }));

  // Derived averages and all-time vault flows.
  const avgSwapSize = data.totalSwaps > 0 ? data.totalSwapVolume / data.totalSwaps : 0;
  const avgTipSize = data.totalTips > 0 ? data.tipsVolume / data.totalTips : 0;
  const vaultDeposits = data.dailyVolumes.reduce(
    (sum, d) => sum + toTokenAmount(d.vaultDeposits),
    0,
  );
  const vaultWithdrawals = data.dailyVolumes.reduce(
    (sum, d) => sum + toTokenAmount(d.vaultWithdrawals),
    0,
  );

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex flex-wrap items-center gap-3 mb-2">
            <BarChart3 size={28} className="text-[var(--primary)]" />
            <h1 className="text-3xl lg:text-4xl font-bold text-[var(--text-primary)]">
              Protocol Analytics
            </h1>
            {indexerStatus && (
              <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live · block {indexerStatus.latestProcessedBlock.toLocaleString('en-US')}
              </span>
            )}
          </div>
          <p className="text-[var(--text-muted)] text-sm lg:text-base">
            Real-time metrics for XyloNet on Arc Network.
            <span className="ml-2 text-xs text-[var(--text-muted)]/70">
              Updated {new Date(data.timestamp).toLocaleTimeString()}
            </span>
          </p>
        </div>

        {/* Section 1: Headline KPIs */}
        <section className="mb-6">
          <OverviewCards
            tvl={tvl}
            volume24h={volume24h}
            totalUsers={totalUsers}
            feeRevenue={feeRevenue}
            volumeChangePct={data.volumeChangePct}
            tvlBreakdown={`Vault ${formatShortUSD(data.vaultTVL)} · Pools ${formatShortUSD(data.poolTVL)}`}
          />
        </section>

        {/* Section 2: Main chart — Volume / Transactions / Vault TVL tabs */}
        <section className="mb-6">
          <MainChart
            data={dailyChart.map((d) => ({
              date: d.date,
              swapVolume: d.swap_volume,
              bridgeVolume: d.bridge_volume,
              tipVolume: d.tip_volume,
              transactions: d.transactions,
              vaultNet: d.vault_net,
            }))}
            totalVolume={data.totalSwapVolume}
            volume7d={volume7d}
            volume30d={volume30d}
          />
        </section>

        {/* Section 3: Secondary protocol metrics */}
        <section className="mb-6">
          <ProtocolMetrics
            totalTransactions={data.totalSwaps}
            transactions24h={swaps24h}
            avgSwapSize={avgSwapSize}
            vaultDeposits={vaultDeposits}
            vaultWithdrawals={vaultWithdrawals}
            avgTipSize={avgTipSize}
          />
        </section>

        {/* Section 4: Pools + Bridge */}
        <section className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-6">
          <div className="lg:col-span-3">
            <PoolsTable pools={data.pools} />
          </div>
          <div className="lg:col-span-2">
            <BridgeChart
              data={bridgeAnalytics.chainData}
              totalVolume={bridgeAnalytics.totalVolume}
              totalCount={bridgeAnalytics.totalCount}
              volume24h={bridgeAnalytics.volume24h}
            />
          </div>
        </section>

        {/* Section 5: Vault + PayX */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <VaultMetrics
            data={data.vault}
            currentTVL={data.vaultTVL}
            currentAPY={data.vaultAPY}
            totalDeposits={vaultDeposits}
            totalWithdrawals={vaultWithdrawals}
          />
          <PayXStats
            totalTips={data.totalTips}
            tipsVolume={data.tipsVolume}
            // Tip-only 24h volume — previously this was passed the combined
            // swap+tip volume, which mislabeled the "24h Volume" stat.
            volume24h={data.tipsVolume24h}
            tips24h={data.tips24h}
            topTippers={topTippers}
          />
        </section>

        {/* Section 6: Recent activity + Top traders */}
        <section className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-6">
          <div className="lg:col-span-3">
            <ActivityFeed
              items={activityItems}
              explorerUrl={ARC_NETWORK.explorer}
              renderedAt={renderedAt}
            />
          </div>
          <div className="lg:col-span-2">
            <TopTraders
              traders={topTraders.map((t) => ({
                address: t.address,
                volume: toTokenAmount(t.totalSwapVolume),
                swapCount: Number(t.swapCount),
              }))}
              explorerUrl={ARC_NETWORK.explorer}
            />
          </div>
        </section>

        {/* Footer note */}
        <div className="text-center text-xs text-[var(--text-muted)] py-4 border-t border-[var(--border)]">
          Data sourced from the Envio HyperIndex on-chain indexer, live Arc RPC
          state, and XyloNet bridge records.
        </div>
      </div>
    </div>
  );
}
