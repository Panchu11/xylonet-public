// ============================================
// XYLONET POINTS SYSTEM V2 - CALCULATOR
// Pure functions for all point calculations
// ============================================

import {
  PRODUCT_CONFIG,
  FIRST_INTERACTION_CONFIG,
  MILESTONE_CONFIG,
  CONSISTENCY_MILESTONES,
  REFERRAL_TIERS,
  REFERRAL_WELCOME_BONUS,
  REFERRAL_QUALIFIED_BONUS,
  getDiversityMultiplier,
  getSybilPenalty,
  getReferralPoints,
} from './config';

import type {
  ProductType,
  InteractionType,
  MilestoneCategory,
  MilestoneTier,
  V2PointsCalculation,
  SybilRisk,
} from './types';

// ============================================
// CORE: Logarithmic Volume Points
// Formula: floor(log2(1 + volume/base) * multiplier)
// No caps - cumulative volume drives points
// ============================================

export function calculateLogPoints(
  volume: number,
  baseVolume: number,
  multiplier: number
): number {
  if (volume <= 0) return 0;
  const logValue = Math.log2(1 + volume / baseVolume);
  return Math.floor(logValue * multiplier);
}

// ============================================
// VOLUME POINTS PER PRODUCT
// ============================================

export function calculateVolumePoints(
  productType: ProductType,
  cumulativeVolume: number
): number {
  const config = PRODUCT_CONFIG[productType];
  if (!config) return 0;
  return calculateLogPoints(cumulativeVolume, config.baseVolume, config.multiplier);
}

// ============================================
// DIVERSITY MULTIPLIER
// Applied only to volume points
// ============================================

export function calculateDiversityMultiplier(productsUsed: number): number {
  return getDiversityMultiplier(productsUsed);
}

// ============================================
// FIRST INTERACTION POINTS
// ============================================

export function calculateFirstInteractionPoints(
  completedInteractions: InteractionType[]
): number {
  let total = 0;
  for (const interaction of completedInteractions) {
    const config = FIRST_INTERACTION_CONFIG[interaction];
    if (config) {
      total += config.points;
    }
  }
  return total;
}

export function qualifiesForFirstInteraction(
  interactionType: InteractionType,
  volume: number
): boolean {
  const config = FIRST_INTERACTION_CONFIG[interactionType];
  if (!config) return false;
  return volume >= config.minVolume;
}

export function getFirstInteractionPoints(
  interactionType: InteractionType
): number {
  return FIRST_INTERACTION_CONFIG[interactionType]?.points ?? 0;
}

// ============================================
// MILESTONE POINTS
// ============================================

export function calculateMilestonePoints(
  category: MilestoneCategory,
  cumulativeVolume: number,
  achievedTiers: MilestoneTier[]
): { total: number; newlyAchieved: Array<{ tier: MilestoneTier; points: number; threshold: number }> } {
  const milestones = MILESTONE_CONFIG[category] || [];
  let total = 0;
  const newlyAchieved: Array<{ tier: MilestoneTier; points: number; threshold: number }> = [];

  for (const milestone of milestones) {
    if (cumulativeVolume >= milestone.threshold) {
      if (!achievedTiers.includes(milestone.tier)) {
        newlyAchieved.push({
          tier: milestone.tier,
          points: milestone.points,
          threshold: milestone.threshold,
        });
      }
      total += milestone.points;
    }
  }

  return { total, newlyAchieved };
}

export function calculateAllMilestonePoints(
  volumes: {
    swap: number;
    vault: number;
    payx_sent: number;
    payx_received: number;
  }
): number {
  let total = 0;
  const categories: Array<{ cat: MilestoneCategory; vol: number }> = [
    { cat: 'swap', vol: volumes.swap },
    { cat: 'vault', vol: volumes.vault },
    { cat: 'payx_sent', vol: volumes.payx_sent },
    { cat: 'payx_received', vol: volumes.payx_received },
  ];

  for (const { cat, vol } of categories) {
    const milestones = MILESTONE_CONFIG[cat] || [];
    for (const milestone of milestones) {
      if (vol >= milestone.threshold) {
        total += milestone.points;
      }
    }
  }

  return total;
}

// Keep backward-compatible checkMilestones
export function checkMilestones(
  category: MilestoneCategory,
  cumulativeVolume: number,
  achievedTiers: MilestoneTier[]
): Array<{ tier: MilestoneTier; points: number; threshold: number }> {
  const { newlyAchieved } = calculateMilestonePoints(category, cumulativeVolume, achievedTiers);
  return newlyAchieved;
}

// ============================================
// CONSISTENCY POINTS
// Based on number of unique active days
// ============================================

export function calculateConsistencyPoints(activeDays: number): number {
  let total = 0;
  for (const milestone of CONSISTENCY_MILESTONES) {
    if (activeDays >= milestone.activeDays) {
      total += milestone.points;
    }
  }
  return total;
}

// ============================================
// REFERRAL POINTS
// ============================================

export function calculateReferralPointsForReferrer(
  currentSuccessfulReferrals: number
): number {
  const nextReferralNumber = currentSuccessfulReferrals + 1;
  return getReferralPoints(nextReferralNumber);
}

export function calculateTotalReferralPoints(
  totalSuccessfulReferrals: number,
  wasReferred: boolean,
  isQualified: boolean
): number {
  let total = 0;

  // Points for referrals made
  for (let i = 1; i <= totalSuccessfulReferrals; i++) {
    total += getReferralPoints(i);
  }

  // Welcome bonus for being referred
  if (wasReferred) {
    total += REFERRAL_WELCOME_BONUS;
  }

  // Qualified bonus
  if (wasReferred && isQualified) {
    total += REFERRAL_QUALIFIED_BONUS;
  }

  return total;
}

// ============================================
// SYBIL PENALTY
// ============================================

export function applySybilPenalty(
  points: number,
  sybilRisk: SybilRisk
): number {
  const multiplier = getSybilPenalty(sybilRisk);
  return Math.floor(points * multiplier);
}

// ============================================
// TOTAL POINTS CALCULATION (V2)
// The master calculation function
// ============================================

export function calculateTotalPoints(params: {
  cumulativeSwapVolume: number;
  cumulativeVaultVolume: number;
  cumulativePayxSent: number;
  cumulativePayxReceived: number;
  productsUsed: number;
  completedFirstInteractions: InteractionType[];
  activeDays: number;
  successfulReferrals: number;
  wasReferred: boolean;
  isReferralQualified: boolean;
  socialPoints: number;
  sybilRisk: SybilRisk;
}): V2PointsCalculation {
  // 1. Volume points per product
  const swapPts = calculateVolumePoints('swap', params.cumulativeSwapVolume);
  const vaultPts = calculateVolumePoints('vault', params.cumulativeVaultVolume);
  const payxSentPts = calculateVolumePoints('payx_sent', params.cumulativePayxSent);
  const payxReceivedPts = calculateVolumePoints('payx_received', params.cumulativePayxReceived);
  const rawVolumeTotal = swapPts + vaultPts + payxSentPts + payxReceivedPts;

  // 2. Diversity multiplier (applied to volume only)
  const diversityMultiplier = calculateDiversityMultiplier(params.productsUsed);
  const adjustedVolumePoints = Math.floor(rawVolumeTotal * diversityMultiplier);

  // 3. Milestone points
  const milestonePoints = calculateAllMilestonePoints({
    swap: params.cumulativeSwapVolume,
    vault: params.cumulativeVaultVolume,
    payx_sent: params.cumulativePayxSent,
    payx_received: params.cumulativePayxReceived,
  });

  // 4. First interaction points
  const firstInteractionPoints = calculateFirstInteractionPoints(
    params.completedFirstInteractions
  );

  // 5. Consistency points
  const consistencyPoints = calculateConsistencyPoints(params.activeDays);

  // 6. Referral points
  const referralPoints = calculateTotalReferralPoints(
    params.successfulReferrals,
    params.wasReferred,
    params.isReferralQualified
  );

  // 7. Social points (passed in)
  const socialPoints = params.socialPoints;

  // 8. Sum all before sybil penalty
  const preTotal = adjustedVolumePoints + milestonePoints + firstInteractionPoints +
    consistencyPoints + referralPoints + socialPoints;

  // 9. Apply sybil penalty
  const sybilMultiplier = getSybilPenalty(params.sybilRisk);
  const totalPoints = Math.floor(preTotal * sybilMultiplier);

  return {
    wallet: '',
    volumePoints: {
      swap: swapPts,
      vault: vaultPts,
      payx_sent: payxSentPts,
      payx_received: payxReceivedPts,
      raw_total: rawVolumeTotal,
    },
    diversityMultiplier,
    adjustedVolumePoints,
    milestonePoints,
    firstInteractionPoints,
    consistencyPoints,
    referralPoints,
    socialPoints,
    sybilMultiplier,
    totalPoints,
  };
}

// ============================================
// VOLUME FILTERING (unchanged utility)
// ============================================

export function filterValidTransactions(
  productType: ProductType,
  transactions: Array<{ volume: number; txHash: string }>
): Array<{ volume: number; txHash: string }> {
  const config = PRODUCT_CONFIG[productType];
  if (!config) return [];
  return transactions.filter(tx => tx.volume >= config.minTxVolume);
}

export function aggregateValidVolume(
  productType: ProductType,
  transactions: Array<{ volume: number; txHash: string }>
): { totalVolume: number; validCount: number; invalidCount: number } {
  const config = PRODUCT_CONFIG[productType];
  if (!config) {
    return { totalVolume: 0, validCount: 0, invalidCount: transactions.length };
  }

  let totalVolume = 0;
  let validCount = 0;
  let invalidCount = 0;

  for (const tx of transactions) {
    if (tx.volume >= config.minTxVolume) {
      totalVolume += tx.volume;
      validCount++;
    } else {
      invalidCount++;
    }
  }

  return { totalVolume, validCount, invalidCount };
}

// ============================================
// EXAMPLE CALCULATIONS (for UI display)
// ============================================

export function generateVolumeExamples(
  productType: ProductType
): Array<{ volume: number; points: number }> {
  const config = PRODUCT_CONFIG[productType];
  if (!config) return [];

  const examples = [10, 50, 100, 250, 500, 1000, 2500, 5000, 10000];

  return examples.map(volume => ({
    volume,
    points: calculateLogPoints(volume, config.baseVolume, config.multiplier),
  }));
}
