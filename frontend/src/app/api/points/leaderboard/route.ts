// ============================================
// API: Points Leaderboard (V2)
// GET /api/points/leaderboard
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Known contract addresses to exclude from leaderboard
const EXCLUDED_CONTRACTS = [
  '0x73742278c31a76dbb0d2587d03ef92e6e2141023', // XyloRouter
  '0x6dd4c1e1db87f0d42c2fc9015a22a94e5c45dee5', // XyloFactory
  '0x3600000000000000000000000000000000000000', // USDC
  '0x89b50855aa3be2f677cd6303cec089b5f319d72a', // EURC
];

function getSupabase() {
  return createClient(supabaseUrl, supabaseServiceKey);
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');
    const userWallet = searchParams.get('wallet');

    const supabase = getSupabase();

    // Get leaderboard entries
    const { data: leaderboard, error, count } = await supabase
      .from('users')
      .select(`
        id,
        wallet_address,
        total_points,
        volume_points,
        milestone_points,
        first_interaction_points,
        consistency_points,
        referral_points,
        social_points,
        diversity_multiplier,
        successful_referrals,
        products_used,
        active_days,
        created_at
      `, { count: 'exact' })
      .gt('total_points', 0)
      .not('wallet_address', 'in', `(${EXCLUDED_CONTRACTS.join(',')})`)
      .order('total_points', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw error;
    }

    // Add ranks
    const rankedLeaderboard = (leaderboard || []).map((user, index) => ({
      ...user,
      rank: offset + index + 1,
      wallet_display: `${user.wallet_address.slice(0, 6)}...${user.wallet_address.slice(-4)}`,
    }));

    // Get user's rank if wallet provided
    let userRank = null;
    if (userWallet) {
      const normalizedWallet = userWallet.toLowerCase();

      const { data: userData } = await supabase
        .from('users')
        .select('id, total_points')
        .eq('wallet_address', normalizedWallet)
        .single();

      if (userData && userData.total_points > 0) {
        const { count: usersAbove } = await supabase
          .from('users')
          .select('id', { count: 'exact', head: true })
          .gt('total_points', userData.total_points);

        userRank = {
          rank: (usersAbove || 0) + 1,
          total_points: userData.total_points,
          wallet_address: normalizedWallet,
        };
      }
    }

    // Get global stats
    const { count: totalParticipants } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .gt('total_points', 0)
      .not('wallet_address', 'in', `(${EXCLUDED_CONTRACTS.join(',')})`);

    let totalPointsDistributed = 0;
    try {
      const { data: pointsSum, error: rpcError } = await supabase
        .rpc('get_total_points_distributed');

      if (!rpcError && pointsSum !== null) {
        totalPointsDistributed = pointsSum;
      }
    } catch {
      console.log('get_total_points_distributed RPC not available');
    }

    return NextResponse.json({
      success: true,
      data: {
        leaderboard: rankedLeaderboard,
        pagination: {
          total: count || 0,
          limit,
          offset,
          has_more: (count || 0) > offset + limit,
        },
        user_rank: userRank,
        stats: {
          total_participants: totalParticipants,
          total_points_distributed: totalPointsDistributed,
        },
      },
    });
  } catch (error) {
    console.error('Leaderboard API error:', error);
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
