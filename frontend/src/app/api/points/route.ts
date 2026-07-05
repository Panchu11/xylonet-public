// ============================================
// API: User Points (V2)
// GET /api/points?wallet=0x...
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getSybilStatusDisplay } from '@/lib/points/quality-score';
import type { SybilRisk } from '@/lib/points/types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

function getSupabase() {
  return createClient(supabaseUrl, supabaseServiceKey);
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const wallet = searchParams.get('wallet');

    if (!wallet) {
      return NextResponse.json(
        { success: false, error: 'Wallet address required' },
        { status: 400 }
      );
    }

    const supabase = getSupabase();
    const normalizedWallet = wallet.toLowerCase();

    // Get user data
    const { data: user, error } = await supabase
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
        sybil_risk,
        referral_code,
        referred_by_code,
        successful_referrals,
        cumulative_swap_volume,
        cumulative_vault_volume,
        cumulative_payx_sent,
        cumulative_payx_received,
        swap_count,
        vault_deposit_count,
        payx_sent_count,
        payx_claim_count,
        products_used,
        active_days,
        first_activity_at,
        last_activity_at,
        created_at
      `)
      .eq('wallet_address', normalizedWallet)
      .single();

    if (error || !user) {
      return NextResponse.json({
        success: true,
        data: {
          wallet_address: normalizedWallet,
          total_points: 0,
          volume_points: 0,
          milestone_points: 0,
          first_interaction_points: 0,
          consistency_points: 0,
          referral_points: 0,
          social_points: 0,
          diversity_multiplier: 1.0,
          sybil_status: getSybilStatusDisplay('low'),
          referral_code: null,
          successful_referrals: 0,
          volumes: {
            swap: 0,
            vault: 0,
            payx_sent: 0,
            payx_received: 0,
          },
          counts: {
            swap: 0,
            vault_deposit: 0,
            payx_sent: 0,
            payx_claim: 0,
          },
          activity: {
            products_used: 0,
            active_days: 0,
            first_activity_at: null,
            last_activity_at: null,
          },
          exists: false,
        },
      });
    }

    // Get first interactions
    const { data: firstInteractions } = await supabase
      .from('first_interactions')
      .select('interaction_type, points_awarded, completed_at')
      .eq('user_id', user.id);

    // Get achieved milestones
    const { data: milestones } = await supabase
      .from('volume_milestones')
      .select('category, tier, points_awarded, achieved_at')
      .eq('user_id', user.id);

    // Get recent points history
    const { data: recentHistory } = await supabase
      .from('points_ledger')
      .select('points_change, reason, category, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20);

    // Get referral stats
    const { data: referralStats } = await supabase
      .from('referrals')
      .select('status')
      .eq('referrer_id', user.id);

    const qualifiedReferrals = referralStats?.filter(r => r.status === 'qualified').length || 0;
    const pendingReferrals = referralStats?.filter(r => r.status === 'pending').length || 0;

    return NextResponse.json({
      success: true,
      data: {
        ...user,
        sybil_status: getSybilStatusDisplay((user.sybil_risk || 'low') as SybilRisk),
        volumes: {
          swap: user.cumulative_swap_volume || 0,
          vault: user.cumulative_vault_volume || 0,
          payx_sent: user.cumulative_payx_sent || 0,
          payx_received: user.cumulative_payx_received || 0,
        },
        counts: {
          swap: user.swap_count || 0,
          vault_deposit: user.vault_deposit_count || 0,
          payx_sent: user.payx_sent_count || 0,
          payx_claim: user.payx_claim_count || 0,
        },
        activity: {
          products_used: user.products_used || 0,
          active_days: user.active_days || 0,
          first_activity_at: user.first_activity_at,
          last_activity_at: user.last_activity_at,
        },
        first_interactions: firstInteractions || [],
        milestones: milestones || [],
        recent_history: recentHistory || [],
        referral_stats: {
          total: referralStats?.length || 0,
          qualified: qualifiedReferrals,
          pending: pendingReferrals,
        },
        exists: true,
      },
    });
  } catch (error) {
    console.error('Points API error:', error);
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
