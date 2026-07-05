// Envio HyperIndex GraphQL client
// Typed query functions for all XyloNet indexed entities
//
// Compatible with both Envio Cloud (hyperindex.xyz) and self-hosted Hasura.
// Since Envio creates the Postgres tables and Hasura tracks them as-is,
// the GraphQL entity names (Swap, Pool, DailyVolume, etc.) and query
// structure remain identical in both modes.

const ENVIO_ENDPOINT =
  process.env.NEXT_PUBLIC_ENVIO_ENDPOINT ||
  "https://indexer.dev.hyperindex.xyz/61ea656/v1/graphql";

// Optional Hasura admin secret — only used for self-hosted deployments.
// Server-side only (no NEXT_PUBLIC_ prefix) so the secret never reaches the browser.
const HASURA_ADMIN_SECRET =
  process.env.HASURA_GRAPHQL_ADMIN_SECRET || undefined;

// ---------------------------------------------------------------------------
// Request throttling (ms between consecutive Envio requests)
// ---------------------------------------------------------------------------

let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 100; // 100ms between requests

async function throttle() {
  const now = Date.now();
  const elapsed = now - lastRequestTime;
  if (elapsed < MIN_REQUEST_INTERVAL) {
    await new Promise((r) => setTimeout(r, MIN_REQUEST_INTERVAL - elapsed));
  }
  lastRequestTime = Date.now();
}

// ---------------------------------------------------------------------------
// Module-level in-memory cache for expensive paginated operations
// ---------------------------------------------------------------------------

const cache = new Map<string, { data: unknown; expiry: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (entry && Date.now() < entry.expiry) return entry.data as T;
  return null;
}

function setCache(key: string, data: unknown) {
  cache.set(key, { data, expiry: Date.now() + CACHE_TTL });
}

// ---------------------------------------------------------------------------
// TypeScript interfaces matching indexer/schema.graphql
// ---------------------------------------------------------------------------

/**
 * Swap event.
 * Numeric fields are serialized BigInt values (numeric strings), NOT ISO dates.
 */
export interface Swap {
  id: string;
  pool: string;
  sender: string;
  tokenIn: string;
  tokenOut: string;
  /** Token amount in as numeric string (BigInt serialized, USDC decimals) */
  amountIn: string;
  /** Token amount out as numeric string (BigInt serialized, USDC decimals) */
  amountOut: string;
  to: string;
  /** Unix timestamp as numeric string (BigInt serialized) */
  timestamp: string;
  /** Block number as numeric string (BigInt serialized) */
  blockNumber: string;
  txHash: string;
}

/**
 * Liquidity pool with pre-computed indexer totals.
 * Numeric fields are serialized BigInt values (numeric strings).
 */
export interface Pool {
  id: string;
  address: string;
  token0: string;
  token1: string;
  /** Cumulative swap volume as numeric string (BigInt serialized) */
  totalVolume: string;
  /** Total transaction count as numeric string (BigInt serialized) */
  txCount: string;
}

/**
 * Liquidity add/remove event.
 * Numeric fields are serialized BigInt values (numeric strings).
 */
export interface LiquidityEvent {
  id: string;
  pool: string;
  provider: string;
  eventType: string;
  /** Token amounts as numeric strings (BigInt serialized) */
  amounts: string[];
  /** LP tokens minted/burned as numeric string (BigInt serialized) */
  lpTokens: string;
  /** Unix timestamp as numeric string (BigInt serialized) */
  timestamp: string;
  /** Block number as numeric string (BigInt serialized) */
  blockNumber: string;
  txHash: string;
}

/**
 * Vault deposit/withdraw event.
 * Numeric fields are serialized BigInt values (numeric strings).
 */
export interface VaultEvent {
  id: string;
  caller: string;
  owner: string;
  /** Asset amount as numeric string (BigInt serialized, USDC decimals) */
  assets: string;
  /** Share amount as numeric string (BigInt serialized) */
  shares: string;
  eventType: string;
  /** Unix timestamp as numeric string (BigInt serialized) */
  timestamp: string;
  /** Block number as numeric string (BigInt serialized) */
  blockNumber: string;
  txHash: string;
}

/**
 * PayX tip event.
 * Numeric fields are serialized BigInt values (numeric strings), NOT ISO dates.
 */
export interface Tip {
  id: string;
  handleHash: string;
  handle: string;
  tipper: string;
  /** Tipped amount as numeric string (BigInt serialized, USDC decimals) */
  amount: string;
  /** Fee taken as numeric string (BigInt serialized, USDC decimals) */
  fee: string;
  message: string;
  /** Unix timestamp as numeric string (BigInt serialized) */
  timestamp: string;
  /** Block number as numeric string (BigInt serialized) */
  blockNumber: string;
  txHash: string;
}

/**
 * PayX tip claim / withdrawal event.
 * Numeric fields are serialized BigInt values (numeric strings).
 */
export interface TipClaim {
  id: string;
  handleHash: string;
  handle: string;
  wallet: string;
  /** Claimed amount as numeric string (BigInt serialized, USDC decimals) */
  amount: string;
  /** Unix timestamp as numeric string (BigInt serialized) */
  timestamp: string;
  /** Block number as numeric string (BigInt serialized) */
  blockNumber: string;
  txHash: string;
}

/**
 * Daily aggregated protocol volumes and counts.
 * Numeric fields are serialized BigInt values (numeric strings).
 */
export interface DailyVolume {
  id: string;
  /** ISO calendar date (YYYY-MM-DD) — this is the only non-numeric string field */
  date: string;
  /** Total swap volume for the day as numeric string (BigInt serialized) */
  swapVolume: string;
  /** Total vault deposits for the day as numeric string (BigInt serialized) */
  vaultDeposits: string;
  /** Total vault withdrawals for the day as numeric string (BigInt serialized) */
  vaultWithdrawals: string;
  /** Total tip volume for the day as numeric string (BigInt serialized) */
  tipVolume: string;
  /** Swap count for the day as numeric string (BigInt serialized) */
  swapCount: string;
  /** Deposit count for the day as numeric string (BigInt serialized) */
  depositCount: string;
  /** Withdrawal count for the day as numeric string (BigInt serialized) */
  withdrawCount: string;
  /** Tip count for the day as numeric string (BigInt serialized) */
  tipCount: string;
}

/**
 * Per-pool daily aggregated swap volume.
 * Numeric fields are serialized BigInt values (numeric strings).
 * NOTE: requires an indexer deployment that includes the PoolDailyVolume
 * entity — callers must handle the query failing on older deployments.
 */
export interface PoolDailyVolume {
  id: string;
  pool: string;
  /** ISO calendar date (YYYY-MM-DD) */
  date: string;
  /** Swap volume for the day as numeric string (BigInt serialized) */
  volume: string;
  /** Swap count for the day as numeric string (BigInt serialized) */
  txCount: string;
}

/**
 * Aggregated per-user protocol activity.
 * Numeric fields are serialized BigInt values (numeric strings), NOT ISO dates.
 */
export interface ProtocolUser {
  id: string;
  address: string;
  /** Swap count as numeric string (BigInt serialized) */
  swapCount: string;
  /** Liquidity event count as numeric string (BigInt serialized) */
  liquidityCount: string;
  /** Vault event count as numeric string (BigInt serialized) */
  vaultCount: string;
  /** Tip count as numeric string (BigInt serialized) */
  tipCount: string;
  /** Total swap volume as numeric string (BigInt serialized) */
  totalSwapVolume: string;
  /** First interaction Unix timestamp as numeric string (BigInt serialized) */
  firstSeenAt: string;
  /** Last interaction Unix timestamp as numeric string (BigInt serialized) */
  lastSeenAt: string;
}

export interface ProtocolOverview {
  totalVolume: bigint;
  totalTVL: bigint;
  userCount: number;
  feeRevenue: bigint;
  poolCount: number;
  swapCount: number;
  tipCount: number;
}

/**
 * Singleton aggregate row written by the indexer on every event.
 * All numeric fields are serialized BigInt strings (GraphQL BigInt → string).
 * This is the preferred zero-pagination source for headline protocol metrics.
 */
export interface ProtocolStatsData {
  totalUsers: string;
  totalSwaps: string;
  totalTips: string;
  totalFeeRevenue: string;
  totalSwapVolume: string;
  totalTipVolume: string;
  totalVaultDeposits: string;
  totalVaultWithdrawals: string;
  lastUpdated: string;
}

// ---------------------------------------------------------------------------
// Generic GraphQL fetch utility
// ---------------------------------------------------------------------------

export async function queryEnvio<T>(
  query: string,
  variables?: Record<string, unknown>,
  options?: { silent?: boolean; retries?: number }
): Promise<T> {
  await throttle();

  const maxRetries = options?.retries ?? 2;
  let lastError: Error | undefined;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10_000);

    try {
      // Build headers — base headers work for both Envio Cloud and Hasura.
      // The Hasura admin secret is only attached when explicitly configured,
      // keeping Envio Cloud requests unaffected.
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        Accept: "application/json",
      };
      if (HASURA_ADMIN_SECRET) {
        headers["X-Hasura-Admin-Secret"] = HASURA_ADMIN_SECRET;
      }

      const response = await fetch(ENVIO_ENDPOINT, {
        method: "POST",
        headers,
        body: JSON.stringify({ query, variables }),
        signal: controller.signal,
      });

      if (response.status === 429) {
        if (!options?.silent) {
          console.warn(
            `[Envio] Rate limited (429), attempt ${attempt + 1}/${maxRetries + 1}`
          );
        }
        if (attempt < maxRetries) {
          await new Promise((r) => setTimeout(r, 1000));
          continue;
        }
      }

      if (!response.ok) {
        if (!options?.silent) {
          console.error(
            `[Envio] HTTP error ${response.status}: ${response.statusText}`
          );
        }
        throw new Error(`Envio request failed: ${response.status}`);
      }

      const json = await response.json();

      if (json.errors?.length) {
        if (!options?.silent) {
          console.error("[Envio] GraphQL errors:", json.errors);
        }
        throw new Error(json.errors[0]?.message ?? "GraphQL error");
      }

      return json.data as T;
    } catch (err) {
      if ((err as Error).name === "AbortError") {
        console.error("[Envio] Request timed out after 30s");
        throw new Error("Envio request timed out");
      }
      lastError = err as Error;
      if (attempt < maxRetries) {
        if (!options?.silent) {
          console.warn(
            `[Envio] Request failed, retrying... (${attempt + 1}/${maxRetries + 1})`
          );
        }
        await new Promise((r) => setTimeout(r, 1000));
        continue;
      }
      if (!options?.silent) {
        console.error("[Envio] Fetch error:", err);
      }
      throw err;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  throw lastError ?? new Error("Envio request failed after retries");
}

// ---------------------------------------------------------------------------
// Pagination helper — fetches all records by walking offset pages
// ---------------------------------------------------------------------------

async function paginateAll<T>(
  queryFn: (offset: number) => Promise<T[]>,
  pageSize = 1000
): Promise<T[]> {
  const all: T[] = [];
  let offset = 0;

  while (true) {
    const page = await queryFn(offset);
    all.push(...page);
    if (page.length < pageSize) break;
    offset += pageSize;
  }

  return all;
}

// ---------------------------------------------------------------------------
// Query functions
// ---------------------------------------------------------------------------

/** Get all pools with volume data (pre-computed totals in the indexer) */
export async function fetchPools(): Promise<Pool[]> {
  const data = await queryEnvio<{ Pool: Pool[] }>(`
    query FetchPools {
      Pool(order_by: { totalVolume: desc }) {
        id
        address
        token0
        token1
        totalVolume
        txCount
      }
    }
  `);
  return data.Pool ?? [];
}

/** Get recent swaps, most recent first */
export async function fetchRecentSwaps(limit = 50): Promise<Swap[]> {
  const data = await queryEnvio<{ Swap: Swap[] }>(
    `
    query FetchRecentSwaps($limit: Int!) {
      Swap(order_by: { timestamp: desc }, limit: $limit) {
        id
        pool
        sender
        tokenIn
        tokenOut
        amountIn
        amountOut
        to
        timestamp
        blockNumber
        txHash
      }
    }
  `,
    { limit }
  );
  return data.Swap ?? [];
}

/** Get vault deposit/withdraw events */
export async function fetchVaultEvents(limit = 50): Promise<VaultEvent[]> {
  const data = await queryEnvio<{ VaultEvent: VaultEvent[] }>(
    `
    query FetchVaultEvents($limit: Int!) {
      VaultEvent(order_by: { timestamp: desc }, limit: $limit) {
        id
        caller
        owner
        assets
        shares
        eventType
        timestamp
        blockNumber
        txHash
      }
    }
  `,
    { limit }
  );
  return data.VaultEvent ?? [];
}

/** Get PayX tips (pageable) */
export async function fetchTips(limit = 50): Promise<Tip[]> {
  const data = await queryEnvio<{ Tip: Tip[] }>(
    `
    query FetchTips($limit: Int!) {
      Tip(order_by: { timestamp: desc }, limit: $limit) {
        id
        handleHash
        handle
        tipper
        amount
        fee
        message
        timestamp
        blockNumber
        txHash
      }
    }
  `,
    { limit }
  );
  return data.Tip ?? [];
}

/** Get tip claims / withdrawals */
export async function fetchTipClaims(limit = 50): Promise<TipClaim[]> {
  const data = await queryEnvio<{ TipClaim: TipClaim[] }>(
    `
    query FetchTipClaims($limit: Int!) {
      TipClaim(order_by: { timestamp: desc }, limit: $limit) {
        id
        handleHash
        handle
        wallet
        amount
        timestamp
        blockNumber
        txHash
      }
    }
  `,
    { limit }
  );
  return data.TipClaim ?? [];
}

/**
 * Top tippers ranked by total tip volume.
 *
 * Strategy: fetch the largest 100 individual tips (ordered by amount desc) and
 * aggregate them by tipper. This avoids the expensive full-table pagination that
 * was hammering Envio with offset queries and triggering 429s, while still giving
 * a reliable top-10/20 leaderboard.
 */
export async function fetchTipLeaderboard(
  limit = 20
): Promise<{ tipper: string; totalAmount: bigint; tipCount: number }[]> {
  const data = await queryEnvio<{ Tip: { tipper: string; amount: string; fee: string }[] }>(
    `
    query FetchTipLeaderboard($limit: Int!) {
      Tip(order_by: { amount: desc }, limit: $limit) {
        tipper
        amount
        fee
      }
    }
  `,
    { limit: 100 }
  );

  const map = new Map<string, { totalAmount: bigint; tipCount: number }>();

  for (const tip of data.Tip ?? []) {
    const existing = map.get(tip.tipper) ?? { totalAmount: 0n, tipCount: 0 };
    map.set(tip.tipper, {
      totalAmount: existing.totalAmount + BigInt(tip.amount),
      tipCount: existing.tipCount + 1,
    });
  }

  return Array.from(map.entries())
    .map(([tipper, stats]) => ({ tipper, ...stats }))
    .sort((a, b) => (b.totalAmount > a.totalAmount ? 1 : -1))
    .slice(0, limit);
}

/**
 * Historical daily volumes, most recent first.
 * Fetches up to 1000 records (DailyVolume has ~176 records — well within one page).
 */
export async function fetchDailyVolumes(days = 365): Promise<DailyVolume[]> {
  const data = await queryEnvio<{ DailyVolume: DailyVolume[] }>(
    `
    query FetchDailyVolumes($limit: Int!) {
      DailyVolume(order_by: { date: desc }, limit: $limit) {
        id
        date
        swapVolume
        vaultDeposits
        vaultWithdrawals
        tipVolume
        swapCount
        depositCount
        withdrawCount
        tipCount
      }
    }
  `,
    { limit: Math.max(days, 1000) }
  );
  return data.DailyVolume ?? [];
}

/**
 * Per-pool daily volumes for the trailing `days` window, newest first.
 *
 * Returns [] (instead of throwing) when the PoolDailyVolume entity does not
 * exist yet — i.e. the indexer hasn't been redeployed with the new schema —
 * so callers can fall back to an estimate.
 */
export async function fetchPoolDailyVolumes(
  days = 8
): Promise<PoolDailyVolume[]> {
  try {
    const data = await queryEnvio<{ PoolDailyVolume: PoolDailyVolume[] }>(
      `
      query FetchPoolDailyVolumes($limit: Int!) {
        PoolDailyVolume(order_by: { date: desc }, limit: $limit) {
          id
          pool
          date
          volume
          txCount
        }
      }
    `,
      // generous headroom: days × pools (currently 2 pools)
      { limit: Math.max(days * 10, 100) },
      // This entity is only present after the indexer is redeployed with the
      // new schema. Stay quiet and fail fast when it is missing so the page
      // gracefully falls back to the sample-based estimate.
      { silent: true, retries: 0 }
    );
    return data.PoolDailyVolume ?? [];
  } catch (e) {
    console.warn(
      "[fetchPoolDailyVolumes] unavailable (indexer not redeployed yet?):",
      e instanceof Error ? e.message : e
    );
    return [];
  }
}

/**
 * Top traders ranked by lifetime swap volume — single ordered page, no pagination.
 */
export async function fetchTopTraders(limit = 5): Promise<ProtocolUser[]> {
  const data = await queryEnvio<{ ProtocolUser: ProtocolUser[] }>(
    `
    query FetchTopTraders($limit: Int!) {
      ProtocolUser(order_by: { totalSwapVolume: desc }, limit: $limit) {
        id
        address
        swapCount
        liquidityCount
        vaultCount
        tipCount
        totalSwapVolume
        firstSeenAt
        lastSeenAt
      }
    }
  `,
    { limit }
  );
  return data.ProtocolUser ?? [];
}

/** Indexer sync status — the latest block processed on Arc. */
export async function fetchIndexerStatus(): Promise<{
  latestProcessedBlock: number;
} | null> {
  try {
    const data = await queryEnvio<{
      chain_metadata: { latest_processed_block: number }[];
    }>(
      `
      query IndexerStatus {
        chain_metadata {
          latest_processed_block
        }
      }
    `,
      undefined,
      { silent: true, retries: 0 }
    );
    const row = data.chain_metadata?.[0];
    return row ? { latestProcessedBlock: row.latest_processed_block } : null;
  } catch {
    return null;
  }
}

/**
 * Count all unique protocol users by paginating with offset.
 * Also returns the full list for use in leaderboards.
 */
export async function fetchProtocolUsers(): Promise<ProtocolUser[]> {
  return paginateAll<ProtocolUser>(async (offset) => {
    const data = await queryEnvio<{ ProtocolUser: ProtocolUser[] }>(
      `
      query FetchProtocolUsers($limit: Int!, $offset: Int!) {
        ProtocolUser(
          order_by: { totalSwapVolume: desc }
          limit: $limit
          offset: $offset
        ) {
          id
          address
          swapCount
          liquidityCount
          vaultCount
          tipCount
          totalSwapVolume
          firstSeenAt
          lastSeenAt
        }
      }
    `,
      { limit: 1000, offset }
    );
    return data.ProtocolUser ?? [];
  });
}

/**
 * Count-only protocol user fetch — much faster than fetching full records.
 * Paginates by fetching only `id` fields until we get < 1000 results.
 */
export async function fetchProtocolUserCount(): Promise<number> {
  const cacheKey = "protocol-user-count";
  const cached = getCached<number>(cacheKey);
  if (cached !== null) return cached;

  let count = 0;
  let offset = 0;
  const PAGE = 1000;

  while (true) {
    const data = await queryEnvio<{ ProtocolUser: { id: string }[] }>(
      `
      query CountProtocolUsers($limit: Int!, $offset: Int!) {
        ProtocolUser(limit: $limit, offset: $offset) {
          id
        }
      }
    `,
      { limit: PAGE, offset }
    );
    const page = data.ProtocolUser ?? [];
    count += page.length;
    if (page.length < PAGE) break;
    offset += PAGE;
  }

  setCache(cacheKey, count);
  return count;
}

/**
 * Paginate all tips for accurate total count and volume.
 * Returns { count, totalAmount, totalFees }.
 */
export async function fetchTipTotals(): Promise<{
  count: number;
  totalAmount: bigint;
  totalFees: bigint;
}> {
  const cacheKey = "tip-totals";
  const cached = getCached<{ count: number; totalAmount: bigint; totalFees: bigint }>(cacheKey);
  if (cached !== null) return cached;

  let count = 0;
  let totalAmount = 0n;
  let totalFees = 0n;
  let offset = 0;
  const PAGE = 1000;

  while (true) {
    const data = await queryEnvio<{ Tip: { amount: string; fee: string }[] }>(
      `
      query FetchTipTotals($limit: Int!, $offset: Int!) {
        Tip(order_by: { timestamp: desc }, limit: $limit, offset: $offset) {
          amount
          fee
        }
      }
    `,
      { limit: PAGE, offset }
    );
    const page = data.Tip ?? [];
    for (const t of page) {
      totalAmount += BigInt(t.amount);
      totalFees += BigInt(t.fee);
    }
    count += page.length;
    if (page.length < PAGE) break;
    offset += PAGE;
  }

  const result = { count, totalAmount, totalFees };
  setCache(cacheKey, result);
  return result;
}

/**
 * Fetch the singleton ProtocolStats row (id = "global").
 *
 * This is a single fast query — no pagination, no client-side aggregation.
 * Prefer this over fetchProtocolOverview for headline metrics.
 */
export async function fetchProtocolStats(): Promise<ProtocolStatsData | null> {
  try {
    const data = await queryEnvio<{ ProtocolStats: ProtocolStatsData[] }>(`{
      ProtocolStats(where: {id: {_eq: "global"}}) {
        totalUsers
        totalSwaps
        totalTips
        totalFeeRevenue
        totalSwapVolume
        totalTipVolume
        totalVaultDeposits
        totalVaultWithdrawals
        lastUpdated
      }
    }`);
    return data.ProtocolStats?.[0] ?? null;
  } catch (e) {
    console.error("[fetchProtocolStats] failed:", e);
    return null;
  }
}

/**
 * Aggregated protocol-level metrics (fallback path — uses pagination).
 *
 * Strategy (no _aggregate support in this Envio instance):
 * - Total swap volume + txCount → Pool.totalVolume (pre-computed in indexer, no pagination needed)
 * - TVL → sum of DailyVolume.vaultDeposits - vaultWithdrawals (176 records, fits in one page)
 * - Total tips count + volume → paginate Tip by offset
 * - Total users → paginate ProtocolUser id-only by offset
 */
export async function fetchProtocolOverview(): Promise<ProtocolOverview> {
  // Quick, single-page fetches can run in parallel.
  const [pools, dailyVolumes] = await Promise.all([
    fetchPools(),
    // Fetch all daily volume records — currently ~176, fits in 1000-item limit
    fetchDailyVolumes(1000),
  ]);

  // Run expensive paginated fetches sequentially to stay well under Envio's
  // rate limit and avoid parallel request storms on large datasets.
  const userCount = await fetchProtocolUserCount();
  const tipTotals = await fetchTipTotals();

  // --- Total swap volume = sum of Pool.totalVolume (pre-computed by indexer) ---
  const totalVolume = pools.reduce(
    (acc, p) => acc + BigInt(p.totalVolume),
    0n
  );

  // --- Total swap tx count = sum of Pool.txCount (pre-computed by indexer) ---
  const swapCount = pools.reduce((acc, p) => acc + Number(p.txCount), 0);

  // --- TVL = cumulative vault deposits minus withdrawals across all DailyVolume records ---
  // DailyVolume is an authoritative aggregate so this covers the full history
  let depositTotal = 0n;
  let withdrawTotal = 0n;
  for (const d of dailyVolumes) {
    depositTotal += BigInt(d.vaultDeposits);
    withdrawTotal += BigInt(d.vaultWithdrawals);
  }
  const totalTVL = depositTotal > withdrawTotal ? depositTotal - withdrawTotal : 0n;

  return {
    totalVolume,
    totalTVL,
    userCount,
    feeRevenue: tipTotals.totalFees,
    poolCount: pools.length,
    swapCount,
    tipCount: tipTotals.count,
  };
}
