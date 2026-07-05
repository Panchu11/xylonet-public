// ============================================
// XYLONET POINTS SYSTEM - REFERRAL LOGIC
// Tier-based decay with unlimited referrals
// ============================================

import { createClient } from '@supabase/supabase-js';
import {
  REFERRAL_TIERS,
  REFERRAL_WELCOME_BONUS,
  REFERRAL_QUALIFIED_BONUS,
  REFERRAL_QUALIFICATION,
  getReferralPoints,
} from './config';

import type {
  Referral,
  ReferralStatus,
  QualificationProgress,
  ReferralStats,
} from './types';

// ============================================
// SUPABASE CLIENT
// ============================================

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

function getSupabaseClient() {
  return createClient(supabaseUrl, supabaseServiceKey);
}

// ============================================
// REFERRAL CODE VALIDATION
// ============================================

/**
 * Validate referral code format
 */
export function isValidReferralCode(code: string): boolean {
  // Format: Allow codes with 11 characters, starting with REF followed by 8 alphanumeric characters
  // Or allow XYL codes (8 chars) for backward compatibility
  const refPattern = /^REF[A-Z0-9]{8}$/;
  const xylPattern = /^XYL[A-Z0-9]{5}$/;
  
  const upperCode = code.toUpperCase();
  return refPattern.test(upperCode) || xylPattern.test(upperCode);
}

/**
 * Check if referral code exists
 */
export async function referralCodeExists(code: string): Promise<{
  exists: boolean;
  userId?: string;
  walletAddress?: string;
}> {
  const supabase = getSupabaseClient();
  
  const { data, error } = await supabase
    .from('users')
    .select('id, wallet_address')
    .eq('referral_code', code.toUpperCase())
    .single();

  if (error || !data) {
    return { exists: false };
  }

  return {
    exists: true,
    userId: data.id,
    walletAddress: data.wallet_address,
  };
}

// ============================================
// REFERRAL APPLICATION
// ============================================

/**
 * Apply referral code to a user
 */
export async function applyReferralCode(
  userId: string,
  referralCode: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = getSupabaseClient();

  // Validate code format
  if (!isValidReferralCode(referralCode)) {
    return { success: false, error: 'Invalid referral code format' };
  }

  const code = referralCode.toUpperCase();

  // Check if code exists
  const codeCheck = await referralCodeExists(code);
  if (!codeCheck.exists) {
    return { success: false, error: 'Referral code not found' };
  }

  // Get current user
  const { data: currentUser } = await supabase
    .from('users')
    .select('id, wallet_address, referred_by_code')
    .eq('id', userId)
    .single();

  if (!currentUser) {
    return { success: false, error: 'User not found' };
  }

  // Check if user already has a referral
  if (currentUser.referred_by_code) {
    return { success: false, error: 'You already used a referral code' };
  }

  // Prevent self-referral
  const { data: referrerUser } = await supabase
    .from('users')
    .select('id, wallet_address')
    .eq('referral_code', code)
    .single();

  if (referrerUser?.id === userId) {
    return { success: false, error: 'Cannot use your own referral code' };
  }

  // Same wallet check (sybil prevention)
  if (referrerUser?.wallet_address?.toLowerCase() === currentUser.wallet_address?.toLowerCase()) {
    return { success: false, error: 'Cannot use referral code from same wallet' };
  }

  // Apply referral
  const { error: updateError } = await supabase
    .from('users')
    .update({ referred_by_code: code })
    .eq('id', userId);

  if (updateError) {
    return { success: false, error: 'Failed to apply referral code' };
  }

  // Create referral record
  const { error: referralError } = await supabase
    .from('referrals')
    .insert({
      referrer_id: referrerUser!.id,
      referred_id: userId,
      referral_code: code,
      status: 'pending',
      qualification_progress: {
        account_age_hours: 0,
        total_volume: 0,
        products_used: 0,
        requirements_met: {
          age: false,
          volume: false,
          products: false,
        },
      },
    });

  if (referralError) {
    console.error('Failed to create referral record:', referralError);
  }

  // Award welcome bonus to the referred user
  await supabase
    .from('users')
    .update({
      referral_points: REFERRAL_WELCOME_BONUS,
    })
    .eq('id', userId);

  // Add welcome bonus to ledger
  await supabase.from('points_ledger').insert({
    user_id: userId,
    points_change: REFERRAL_WELCOME_BONUS,
    reason: 'Referral welcome bonus',
    category: 'referral',
  });

  return { success: true };
}

// ============================================
// REFERRAL QUALIFICATION
// ============================================

/**
 * Calculate qualification progress for a referred user
 */
export async function calculateQualificationProgress(
  userId: string
): Promise<QualificationProgress> {
  const supabase = getSupabaseClient();

  const { data: user } = await supabase
    .from('users')
    .select(`
      created_at,
      cumulative_swap_volume,
      cumulative_vault_volume,
      cumulative_payx_sent,
      cumulative_payx_received,
      products_used
    `)
    .eq('id', userId)
    .single();

  if (!user) {
    return {
      account_age_hours: 0,
      total_volume: 0,
      products_used: 0,
      requirements_met: {
        age: false,
        volume: false,
        products: false,
      },
    };
  }

  // Calculate account age in hours
  const createdAt = new Date(user.created_at);
  const now = new Date();
  const accountAgeHours = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);

  // Calculate total volume
  const totalVolume =
    (user.cumulative_swap_volume || 0) +
    (user.cumulative_vault_volume || 0) +
    (user.cumulative_payx_sent || 0) +
    (user.cumulative_payx_received || 0);

  // Count products used
  let productsUsed = 0;
  if (user.cumulative_swap_volume > 0) productsUsed++;
  if (user.cumulative_vault_volume > 0) productsUsed++;
  if (user.cumulative_payx_sent > 0) productsUsed++;
  if ((user.cumulative_payx_received || 0) > 0) productsUsed++;

  const { minAccountAgeHours, minTotalVolume, minProductsUsed } =
    REFERRAL_QUALIFICATION;

  return {
    account_age_hours: accountAgeHours,
    total_volume: totalVolume,
    products_used: productsUsed,
    requirements_met: {
      age: accountAgeHours >= minAccountAgeHours,
      volume: totalVolume >= minTotalVolume,
      products: productsUsed >= minProductsUsed,
    },
  };
}

/**
 * Check if a referral is fully qualified
 */
export function isFullyQualified(progress: QualificationProgress): boolean {
  return (
    progress.requirements_met.age &&
    progress.requirements_met.volume &&
    progress.requirements_met.products
  );
}

/**
 * Update referral qualification status
 */
export async function updateReferralQualification(
  referralId: string
): Promise<{ qualified: boolean; progress: QualificationProgress }> {
  const supabase = getSupabaseClient();

  // Get referral
  const { data: referral } = await supabase
    .from('referrals')
    .select('referred_id, status')
    .eq('id', referralId)
    .single();

  if (!referral || referral.status !== 'pending') {
    return {
      qualified: referral?.status === 'qualified',
      progress: {
        account_age_hours: 0,
        total_volume: 0,
        products_used: 0,
        requirements_met: { age: false, volume: false, products: false },
      },
    };
  }

  // Calculate progress
  const progress = await calculateQualificationProgress(referral.referred_id);
  const qualified = isFullyQualified(progress);

  // Update referral record
  await supabase
    .from('referrals')
    .update({
      qualification_progress: progress,
      status: qualified ? 'qualified' : 'pending',
      qualified_at: qualified ? new Date().toISOString() : null,
    })
    .eq('id', referralId);

  return { qualified, progress };
}

// ============================================
// REFERRAL POINTS AWARDING
// ============================================

/**
 * Award points for a qualified referral
 */
export async function awardReferralPoints(
  referralId: string
): Promise<{ success: boolean; referrerPoints: number; referredPoints: number }> {
  const supabase = getSupabaseClient();

  // Get referral details
  const { data: referral } = await supabase
    .from('referrals')
    .select('referrer_id, referred_id, status, referrer_points_awarded')
    .eq('id', referralId)
    .single();

  if (!referral || referral.status !== 'qualified' || referral.referrer_points_awarded > 0) {
    return { success: false, referrerPoints: 0, referredPoints: 0 };
  }

  // Get referrer's current successful referrals count
  const { data: referrer } = await supabase
    .from('users')
    .select('successful_referrals, referral_points')
    .eq('id', referral.referrer_id)
    .single();

  if (!referrer) {
    return { success: false, referrerPoints: 0, referredPoints: 0 };
  }

  // Calculate points based on tier
  const currentCount = referrer.successful_referrals || 0;
  const referrerPoints = getReferralPoints(currentCount + 1);
  const referredPoints = REFERRAL_QUALIFIED_BONUS;

  // Update referrer
  await supabase
    .from('users')
    .update({
      successful_referrals: currentCount + 1,
      referral_points: (referrer.referral_points || 0) + referrerPoints,
      total_points: supabase.rpc('increment_total_points', {
        row_id: referral.referrer_id,
        amount: referrerPoints,
      }),
    })
    .eq('id', referral.referrer_id);

  // Update referred user
  const { data: referred } = await supabase
    .from('users')
    .select('referral_points')
    .eq('id', referral.referred_id)
    .single();

  await supabase
    .from('users')
    .update({
      referral_points: (referred?.referral_points || 0) + referredPoints,
      total_points: supabase.rpc('increment_total_points', {
        row_id: referral.referred_id,
        amount: referredPoints,
      }),
    })
    .eq('id', referral.referred_id);

  // Update referral record
  await supabase
    .from('referrals')
    .update({
      referrer_points_awarded: referrerPoints,
      referred_points_awarded: referredPoints,
    })
    .eq('id', referralId);

  // Add to points ledger
  await Promise.all([
    supabase.from('points_ledger').insert({
      user_id: referral.referrer_id,
      points_change: referrerPoints,
      reason: `Referral qualified (referral #${currentCount + 1})`,
      category: 'referral',
      reference_id: referralId,
    }),
    supabase.from('points_ledger').insert({
      user_id: referral.referred_id,
      points_change: referredPoints,
      reason: 'Referral qualification bonus',
      category: 'referral',
      reference_id: referralId,
    }),
  ]);

  return { success: true, referrerPoints, referredPoints };
}

// ============================================
// REFERRAL STATS
// ============================================

/**
 * Get referral stats for a user
 */
export async function getReferralStats(userId: string): Promise<ReferralStats> {
  const supabase = getSupabaseClient();

  // Get user's referral code
  const { data: user } = await supabase
    .from('users')
    .select('referral_code, successful_referrals, referral_points')
    .eq('id', userId)
    .single();

  if (!user) {
    return {
      total_referrals: 0,
      qualified_referrals: 0,
      pending_referrals: 0,
      total_points_earned: 0,
      referral_code: '',
    };
  }

  // Get referral counts
  const { data: referrals } = await supabase
    .from('referrals')
    .select('status')
    .eq('referrer_id', userId);

  const total = referrals?.length || 0;
  const qualified = referrals?.filter((r) => r.status === 'qualified').length || 0;
  const pending = referrals?.filter((r) => r.status === 'pending').length || 0;

  return {
    total_referrals: total,
    qualified_referrals: qualified,
    pending_referrals: pending,
    total_points_earned: user.referral_points || 0,
    referral_code: user.referral_code || '',
  };
}

/**
 * Get all referrals for a user
 */
export async function getUserReferrals(
  userId: string
): Promise<Referral[]> {
  const supabase = getSupabaseClient();

  const { data } = await supabase
    .from('referrals')
    .select('*')
    .eq('referrer_id', userId)
    .order('referred_at', { ascending: false });

  return (data as Referral[]) || [];
}

/**
 * Get pending referrals that need qualification check
 */
export async function getPendingReferrals(): Promise<Referral[]> {
  const supabase = getSupabaseClient();

  // V2: No qualification window - pending referrals stay until qualified
  const { data } = await supabase
    .from('referrals')
    .select('*')
    .eq('status', 'pending');

  return (data as Referral[]) || [];
}

// ============================================
// BATCH PROCESSING
// ============================================

/**
 * Process all pending referrals
 */
export async function processAllPendingReferrals(): Promise<{
  processed: number;
  qualified: number;
  pointsAwarded: number;
}> {
  const supabase = getSupabaseClient();
  let processed = 0;
  let qualified = 0;
  let pointsAwarded = 0;

  // Get all pending referrals (V2: no expiry window)
  const { data: pendingReferrals } = await supabase
    .from('referrals')
    .select('id, referred_at')
    .eq('status', 'pending');

  for (const referral of pendingReferrals || []) {
    processed++;

    // Check qualification
    const { qualified: isQualified } = await updateReferralQualification(referral.id);

    if (isQualified) {
      const result = await awardReferralPoints(referral.id);
      if (result.success) {
        qualified++;
        pointsAwarded += result.referrerPoints + result.referredPoints;
      }
    }
  }

  return { processed, qualified, pointsAwarded };
}

// ============================================
// REFERRAL TIER INFO
// ============================================

/**
 * Get referral tier information for a user
 */
export function getReferralTierInfo(currentReferrals: number): {
  currentTier: number;
  pointsPerReferral: number;
  nextTierAt: number | null;
  nextTierPoints: number | null;
  referralsInCurrentTier: number;
} {
  let tierIndex = 0;
  for (let i = 0; i < REFERRAL_TIERS.length; i++) {
    const tier = REFERRAL_TIERS[i];
    if (currentReferrals >= tier.minReferral && currentReferrals <= tier.maxReferral) {
      tierIndex = i;
      break;
    }
  }

  const currentTier = REFERRAL_TIERS[tierIndex];
  const nextTier = REFERRAL_TIERS[tierIndex + 1];

  return {
    currentTier: tierIndex + 1,
    pointsPerReferral: currentTier.pointsEach,
    nextTierAt: nextTier ? nextTier.minReferral : null,
    nextTierPoints: nextTier ? nextTier.pointsEach : null,
    referralsInCurrentTier: Math.min(
      currentReferrals - currentTier.minReferral + 1,
      currentTier.maxReferral - currentTier.minReferral + 1
    ),
  };
}
