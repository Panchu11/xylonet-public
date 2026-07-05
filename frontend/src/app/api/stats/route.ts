// ============================================
// API: Protocol Stats
// Returns cached protocol statistics for fast loading
// Data sourced from Envio HyperIndex GraphQL
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import {
  fetchPools,
  fetchDailyVolumes,
  fetchProtocolUsers,
  fetchTips,
} from '@/lib/envio';

export async function GET(request: NextRequest) {
  try {
    // Fetch all required data from Envio in parallel
    const [pools, dailyVolumes, users, recentTips] = await Promise.all([
      fetchPools(),              // All pools for swap volume
      fetchDailyVolumes(365),    // Daily aggregates for totals + history
      fetchProtocolUsers(),      // All protocol users for count + activity
      fetchTips(2000),           // Recent tips for 24h metrics + fee revenue
    ]);

    // ---- Volume metrics ----

    // Swap volume: sum of cumulative totalVolume across all pools
    const swapVolume = pools.reduce(
      (sum, p) => sum + Number(p.totalVolume),
      0
    );

    // Tip (PayX) volume: aggregated from daily volumes for accuracy
    const tipVolume = dailyVolumes.reduce(
      (sum, d) => sum + Number(d.tipVolume),
      0
    );
    const tipCount = dailyVolumes.reduce(
      (sum, d) => sum + Number(d.tipCount),
      0
    );

    // Vault volume: total deposits aggregated from daily volumes
    const vaultVolume = dailyVolumes.reduce(
      (sum, d) => sum + Number(d.vaultDeposits),
      0
    );

    // Bridge volume: bridge transactions are not indexed by the Envio HyperIndex
    const bridgeVolume = 0;

    // ---- 24h metrics ----
    const twentyFourHoursAgo = Math.floor(Date.now() / 1000) - 24 * 60 * 60;

    const tipsLast24h = recentTips.filter(
      (t) => Number(t.timestamp) >= twentyFourHoursAgo
    );
    const tipVolume24h = tipsLast24h.reduce(
      (sum, t) => sum + Number(t.amount),
      0
    );
    const tips24h = tipsLast24h.length;

    // Add swap volume from today's daily entry if available
    const today = new Date().toISOString().split('T')[0];
    const todayVolume = dailyVolumes.find((d) => d.date === today);
    const swapVolume24h = todayVolume ? Number(todayVolume.swapVolume) : 0;

    // ---- User stats ----
    const totalUsers = users.length;
    const activeUsers24h = users.filter(
      (u) => Number(u.lastSeenAt) >= twentyFourHoursAgo
    ).length;

    // ---- TVL: net vault deposits (deposits minus withdrawals) ----
    const tvl = dailyVolumes.reduce(
      (acc, d) => acc + Number(d.vaultDeposits) - Number(d.vaultWithdrawals),
      0
    );

    // ---- Fee revenue: estimated from recent tips (limited sample) ----
    const feeRevenue = recentTips.reduce(
      (sum, t) => sum + Number(t.fee),
      0
    );

    // ---- Last synced info (derived from latest indexed entity) ----
    const latestTip = recentTips.length > 0 ? recentTips[0] : null;
    const lastSyncedBlock = latestTip ? Number(latestTip.blockNumber) : 0;
    const lastSyncedAt = latestTip?.timestamp ?? null;

    // ---- Bridge analytics ----
    // Bridge transactions are not indexed by the Envio HyperIndex
    const bridge = null;

    // ---- Historical data (last 30 days) ----
    const history = {
      daily: dailyVolumes.slice(0, 30).map((d) => ({
        date: d.date,
        swap_volume: Number(d.swapVolume) || 0,
        bridge_volume: 0, // Bridge data not available in Envio indexer
        tip_volume: Number(d.tipVolume) || 0,
        unique_users: 0,  // Per-day unique users not available in DailyVolume entity
      })),
    };

    // ---- Protocol overview ----
    const totalVolume = Math.round(
      swapVolume + bridgeVolume + vaultVolume + tipVolume
    );
    const overview = {
      total_users: totalUsers,
      active_users_24h: activeUsers24h,
      total_volume: totalVolume,
      volume_24h: Math.round(tipVolume24h + swapVolume24h),
    };

    const stats = {
      // Volume stats (in USD)
      swap_volume: Math.round(swapVolume),
      bridge_volume: Math.round(bridgeVolume),
      vault_volume: Math.round(vaultVolume),
      payx_volume: Math.round(tipVolume),
      total_volume: totalVolume,

      // User stats
      total_users: totalUsers,

      // PayX stats
      total_tips: tipCount,
      tips_volume: Math.round(tipVolume),
      volume_24h: Math.round(tipVolume24h),
      tips_24h: tips24h,

      // Sync info (derived from latest indexed block)
      last_synced_block: lastSyncedBlock,
      last_synced_at: lastSyncedAt,

      // TVL & fee revenue (new fields sourced from Envio)
      tvl: Math.round(Math.max(0, tvl)),
      fee_revenue: Math.round(feeRevenue),

      // Nested sections
      bridge,
      history,
      overview,

      // Metadata
      source: 'envio',
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(
      { success: true, data: stats },
      {
        headers: {
          'Cache-Control':
            'public, s-maxage=60, stale-while-revalidate=300',
        },
      }
    );
  } catch (error) {
    console.error('[Stats API] Error fetching from Envio:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
