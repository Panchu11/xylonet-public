import { supabase } from '@/lib/supabase';

// ---------------------------------------------------------------------------
// Types — mirrors what BridgeChart.tsx / VolumeChart expect
// ---------------------------------------------------------------------------

export interface ChainData {
  chain: string;
  volume: number;
  count: number;
}

export interface BridgeDailyVolume {
  /** UTC calendar date, YYYY-MM-DD */
  date: string;
  volume: number;
}

export interface BridgeAnalytics {
  chainData: ChainData[];
  totalVolume: number;
  totalCount: number;
  volume24h: number;
  /** Per-day bridge volume (ascending by date) for the volume chart. */
  dailyVolumes: BridgeDailyVolume[];
}

const EMPTY_RESULT: BridgeAnalytics = {
  chainData: [],
  totalVolume: 0,
  totalCount: 0,
  volume24h: 0,
  dailyVolumes: [],
};

// ---------------------------------------------------------------------------
// fetchBridgeAnalytics
//
// Preferred path: the `bridge_analytics_summary` Postgres function (see
// frontend/sql/bridge_analytics_summary_rpc.sql). Aggregation happens in the
// database, so results are exact regardless of row count.
//
// Fallback path (RPC not yet deployed): paginate raw rows with .range().
// NOTE: PostgREST caps each response at 1,000 rows (max-rows) — a single
// .limit(10000) call silently truncates. The old implementation did exactly
// that, which is why the dashboard showed exactly 1,000 transfers and a
// total equal to the 24h volume.
//
// Only `state = 'success'` rows are included so that volume and transfer
// counts reflect actual settled cross-chain movement.
//
// Runs server-side only (called from the analytics server component).
// ---------------------------------------------------------------------------

interface RpcSummary {
  total_volume: number;
  total_count: number;
  volume_24h: number;
  chains: { chain: string; volume: number; count: number }[];
  daily: { date: string; volume: number }[];
}

export async function fetchBridgeAnalytics(days = 30): Promise<BridgeAnalytics> {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    console.warn('[Bridge Analytics] Supabase credentials not configured');
    return EMPTY_RESULT;
  }

  // --- Preferred: exact aggregation in Postgres ---
  const { data: rpcData, error: rpcError } = await supabase.rpc(
    'bridge_analytics_summary',
    { p_days: days },
  );

  if (!rpcError && rpcData) {
    const summary = rpcData as RpcSummary;
    return {
      chainData: (summary.chains ?? []).map((c) => ({
        chain: c.chain,
        volume: Number(c.volume) || 0,
        count: Number(c.count) || 0,
      })),
      totalVolume: Number(summary.total_volume) || 0,
      totalCount: Number(summary.total_count) || 0,
      volume24h: Number(summary.volume_24h) || 0,
      dailyVolumes: (summary.daily ?? []).map((d) => ({
        date: d.date,
        volume: Number(d.volume) || 0,
      })),
    };
  }

  console.warn(
    '[Bridge Analytics] RPC bridge_analytics_summary unavailable, falling back to paginated rows:',
    rpcError?.message,
  );
  return fetchBridgeAnalyticsPaginated(days);
}

// ---------------------------------------------------------------------------
// Fallback: paginate raw rows and aggregate client-side.
// Correct (walks every page) but heavier than the RPC — kept only so the
// dashboard works before the SQL migration is applied.
// ---------------------------------------------------------------------------

const PAGE_SIZE = 1000;
const MAX_PAGES = 100; // safety cap: 100k rows

async function fetchBridgeAnalyticsPaginated(
  days: number,
): Promise<BridgeAnalytics> {
  const now = Date.now();
  const since = new Date(now - days * 86_400_000);
  const dayAgo = new Date(now - 86_400_000);

  const chainMap = new Map<string, { volume: number; count: number }>();
  const dailyMap = new Map<string, number>();
  let totalVolume = 0;
  let totalCount = 0;
  let volume24h = 0;

  for (let page = 0; page < MAX_PAGES; page++) {
    const from = page * PAGE_SIZE;
    const { data, error } = await supabase
      .from('bridge_transactions')
      .select('destination_chain, amount, created_at')
      .eq('state', 'success')
      .gte('created_at', since.toISOString())
      .order('created_at', { ascending: false })
      .range(from, from + PAGE_SIZE - 1);

    if (error) {
      console.error('[Bridge Analytics] Supabase query failed:', error.message);
      return page === 0
        ? EMPTY_RESULT
        : buildResult(chainMap, dailyMap, totalVolume, totalCount, volume24h);
    }

    const rows = data ?? [];

    for (const row of rows) {
      const chain = row.destination_chain;
      // DECIMAL(20,6) may arrive as a string from PostgREST
      const amount =
        typeof row.amount === 'string'
          ? parseFloat(row.amount)
          : Number(row.amount);
      if (!Number.isFinite(amount)) continue;

      const createdAtMs = new Date(row.created_at).getTime();
      const dateKey = new Date(createdAtMs).toISOString().split('T')[0];

      let entry = chainMap.get(chain);
      if (!entry) {
        entry = { volume: 0, count: 0 };
        chainMap.set(chain, entry);
      }
      entry.volume += amount;
      entry.count += 1;

      dailyMap.set(dateKey, (dailyMap.get(dateKey) ?? 0) + amount);

      totalVolume += amount;
      totalCount += 1;

      if (createdAtMs >= dayAgo.getTime()) {
        volume24h += amount;
      }
    }

    if (rows.length < PAGE_SIZE) break; // last page
  }

  return buildResult(chainMap, dailyMap, totalVolume, totalCount, volume24h);
}

function buildResult(
  chainMap: Map<string, { volume: number; count: number }>,
  dailyMap: Map<string, number>,
  totalVolume: number,
  totalCount: number,
  volume24h: number,
): BridgeAnalytics {
  const chainData: ChainData[] = Array.from(chainMap.entries())
    .map(([chain, val]) => ({
      chain,
      volume: Math.round(val.volume * 100) / 100,
      count: val.count,
    }))
    .sort((a, b) => b.volume - a.volume);

  const dailyVolumes: BridgeDailyVolume[] = Array.from(dailyMap.entries())
    .map(([date, volume]) => ({ date, volume: Math.round(volume * 100) / 100 }))
    .sort((a, b) => (a.date < b.date ? -1 : 1));

  return {
    chainData,
    totalVolume: Math.round(totalVolume * 100) / 100,
    totalCount,
    volume24h: Math.round(volume24h * 100) / 100,
    dailyVolumes,
  };
}
