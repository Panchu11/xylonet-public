// ============================================
// API: Referrals
// Get and apply referral codes
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import {
  isValidReferralCode,
  referralCodeExists,
  getReferralStats,
  getUserReferrals,
  getReferralTierInfo,
  REFERRAL_QUALIFICATION,
} from '@/lib/points';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

function getSupabase() {
  return createClient(supabaseUrl, supabaseServiceKey);
}

/**
 * GET /api/referrals?wallet=0x...
 * Get user's referral code and stats
 */
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

    // Get user
    const { data: user, error } = await supabase
      .from('users')
      .select('id, referral_code, referred_by_code, successful_referrals, referral_points')
      .eq('wallet_address', normalizedWallet)
      .single();

    if (error || !user) {
      return NextResponse.json({
        success: true,
        data: {
          has_referral_code: false,
          referral_code: null,
          is_referred: false,
          referred_by: null,
          stats: null,
          referrals: [],
          tier_info: null,
          qualification_requirements: REFERRAL_QUALIFICATION,
        },
      });
    }

    // Get referral stats
    const stats = await getReferralStats(user.id);

    // Get user's referrals
    const referrals = await getUserReferrals(user.id);

    // Get tier info
    const tierInfo = getReferralTierInfo(user.successful_referrals || 0);

    // Format referrals for response
    const formattedReferrals = await Promise.all(
      referrals.map(async (ref) => {
        // Get referred user's wallet
        const { data: referredUser } = await supabase
          .from('users')
          .select('wallet_address')
          .eq('id', ref.referred_id)
          .single();

        return {
          id: ref.id,
          referred_wallet: referredUser?.wallet_address
            ? `${referredUser.wallet_address.slice(0, 6)}...${referredUser.wallet_address.slice(-4)}`
            : 'Unknown',
          status: ref.status,
          qualification_progress: ref.qualification_progress,
          referred_at: ref.referred_at,
          qualified_at: ref.qualified_at,
          points_awarded: ref.referrer_points_awarded,
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: {
        has_referral_code: !!user.referral_code,
        referral_code: user.referral_code,
        is_referred: !!user.referred_by_code,
        referred_by: user.referred_by_code,
        stats: {
          ...stats,
          total_points_earned: user.referral_points || 0,
        },
        referrals: formattedReferrals,
        tier_info: tierInfo,
        qualification_requirements: REFERRAL_QUALIFICATION,
      },
    });
  } catch (error) {
    console.error('Referrals GET error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/referrals
 * Apply a referral code
 * Body: { wallet: string, referral_code: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { wallet, referral_code } = body;

    if (!wallet || !referral_code) {
      return NextResponse.json(
        { success: false, error: 'Wallet and referral_code required' },
        { status: 400 }
      );
    }

    // Validate code format
    if (!isValidReferralCode(referral_code)) {
      return NextResponse.json(
        { success: false, error: 'Invalid referral code format' },
        { status: 400 }
      );
    }

    const supabase = getSupabase();
    const normalizedWallet = wallet.toLowerCase();
    const code = referral_code.toUpperCase();

    // Check if code exists
    const codeCheck = await referralCodeExists(code);
    if (!codeCheck.exists) {
      return NextResponse.json(
        { success: false, error: 'Referral code not found' },
        { status: 404 }
      );
    }

    // Get current user
    const { data: currentUser, error: userError } = await supabase
      .from('users')
      .select('id, wallet_address, referred_by_code, referral_code')
      .eq('wallet_address', normalizedWallet)
      .single();

    if (userError || !currentUser) {
      return NextResponse.json(
        { success: false, error: 'User not found. Please connect your wallet first.' },
        { status: 404 }
      );
    }

    // Check if already referred
    if (currentUser.referred_by_code) {
      return NextResponse.json(
        { success: false, error: 'You have already used a referral code' },
        { status: 400 }
      );
    }

    // Prevent self-referral
    if (currentUser.referral_code === code) {
      return NextResponse.json(
        { success: false, error: 'Cannot use your own referral code' },
        { status: 400 }
      );
    }

    // Get referrer
    const { data: referrer, error: refError } = await supabase
      .from('users')
      .select('id, wallet_address')
      .eq('referral_code', code)
      .single();

    if (refError || !referrer) {
      return NextResponse.json(
        { success: false, error: 'Referrer not found' },
        { status: 404 }
      );
    }

    // Same wallet check (sybil prevention)
    if (referrer.wallet_address?.toLowerCase() === normalizedWallet) {
      return NextResponse.json(
        { success: false, error: 'Cannot use referral code from same wallet' },
        { status: 400 }
      );
    }

    // Apply referral code
    const { error: updateError } = await supabase
      .from('users')
      .update({ referred_by_code: code })
      .eq('id', currentUser.id);

    if (updateError) {
      throw updateError;
    }

    // Create referral record
    await supabase.from('referrals').insert({
      referrer_id: referrer.id,
      referred_id: currentUser.id,
      referral_code: code,
      status: 'pending',
      qualification_progress: {
        account_age_hours: 0,
        total_volume: 0,
        products_used: 0,
        active_days: 0,
        requirements_met: {
          age: false,
          volume: false,
          products: false,
          days: false,
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Referral code applied successfully!',
      data: {
        referrer_wallet: `${referrer.wallet_address.slice(0, 6)}...${referrer.wallet_address.slice(-4)}`,
        qualification_requirements: REFERRAL_QUALIFICATION,
      },
    });
  } catch (error) {
    console.error('Referrals POST error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/referrals
 * Validate a referral code (check if it exists)
 * Body: { referral_code: string }
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { referral_code } = body;

    if (!referral_code) {
      return NextResponse.json(
        { success: false, error: 'Referral code required' },
        { status: 400 }
      );
    }

    // Validate format
    if (!isValidReferralCode(referral_code)) {
      return NextResponse.json({
        success: true,
        data: {
          valid: false,
          exists: false,
          reason: 'Invalid format',
        },
      });
    }

    // Check if exists
    const codeCheck = await referralCodeExists(referral_code.toUpperCase());

    return NextResponse.json({
      success: true,
      data: {
        valid: true,
        exists: codeCheck.exists,
        reason: codeCheck.exists ? 'Code is valid' : 'Code not found',
      },
    });
  } catch (error) {
    console.error('Referrals PUT error:', error);
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
