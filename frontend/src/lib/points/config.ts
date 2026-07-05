// ============================================
// XYLONET POINTS SYSTEM V2 - CONFIGURATION
// ============================================

import type {
  ProductConfig,
  FirstInteractionConfig,
  MilestoneConfig,
  ConsistencyMilestone,
  DiversityConfig,
  ReferralTier,
  InteractionType,
  MilestoneCategory,
} from './types';

// ============================================
// PRODUCT POINTS CONFIGURATION (V2 - 5x multipliers)
// Logarithmic scaling: points = floor(log2(1 + volume/base) * multiplier)
// No daily caps, no lifetime caps - cumulative volume only
// ============================================

export const PRODUCT_CONFIG: Record<string, ProductConfig> = {
  swap: {
    baseVolume: 10,        // $10 base
    multiplier: 25,        // 5x from v1 (was 5)
    minTxVolume: 5,        // Min $5 per swap
  },
  vault: {
    baseVolume: 25,        // $25 base
    multiplier: 30,        // 5x from v1 (was 8, rounded to 30)
    minTxVolume: 10,       // Min $10 deposit
  },
  payx_sent: {
    baseVolume: 1,         // $1 base
    multiplier: 20,        // ~7x from v1 (was 3)
    minTxVolume: 0.01,     // Contract minimum
  },
  payx_received: {
    baseVolume: 5,         // $5 base (only claimed users)
    multiplier: 12,        // 6x from v1 (was 2)
    minTxVolume: 0.01,     // Any received tip
  },
};

// ============================================
// DIVERSITY MULTIPLIER
// Applied to volume points only
// Rewards users who interact with multiple products
// ============================================

export const DIVERSITY_CONFIG: DiversityConfig = {
  products1: 1.0,          // 1 product used
  products2: 1.25,         // 2 products used
  products3Plus: 1.5,      // 3+ products used
};

export function getDiversityMultiplier(productsUsed: number): number {
  if (productsUsed >= 3) return DIVERSITY_CONFIG.products3Plus;
  if (productsUsed === 2) return DIVERSITY_CONFIG.products2;
  return DIVERSITY_CONFIG.products1;
}

// ============================================
// FIRST INTERACTION BONUSES (V2 - 350 XP total)
// One-time bonuses for first use of each product
// ============================================

export const FIRST_INTERACTION_CONFIG: Record<InteractionType, FirstInteractionConfig> = {
  first_swap: {
    points: 100,           // +100% from v1 (was 50)
    minVolume: 5,
  },
  first_vault: {
    points: 100,           // +100% from v1 (was 50)
    minVolume: 10,
  },
  first_payx_tip: {
    points: 75,            // +50% from v1 (was 50)
    minVolume: 0.01,
  },
  first_payx_claim: {
    points: 75,            // +200% from v1 (was 25)
    minVolume: 0,
  },
};

export const TOTAL_FIRST_INTERACTION_POINTS = Object.values(FIRST_INTERACTION_CONFIG)
  .reduce((sum, config) => sum + config.points, 0); // 350 pts

// ============================================
// VOLUME MILESTONES (V2 - 3,125 XP total)
// Cumulative volume achievements (one-time)
// Now per-product category including payx_received
// ============================================

export const MILESTONE_CONFIG: Record<MilestoneCategory, MilestoneConfig[]> = {
  swap: [
    { tier: 'bronze', threshold: 25, points: 25 },
    { tier: 'silver', threshold: 100, points: 50 },
    { tier: 'gold', threshold: 500, points: 100 },
    { tier: 'platinum', threshold: 2500, points: 200 },
    { tier: 'diamond', threshold: 10000, points: 350 },
    { tier: 'legendary', threshold: 50000, points: 500 },
  ],
  vault: [
    { tier: 'bronze', threshold: 25, points: 25 },
    { tier: 'silver', threshold: 100, points: 50 },
    { tier: 'gold', threshold: 500, points: 100 },
    { tier: 'platinum', threshold: 2500, points: 200 },
    { tier: 'diamond', threshold: 10000, points: 350 },
  ],
  payx_sent: [
    { tier: 'bronze', threshold: 5, points: 20 },
    { tier: 'silver', threshold: 25, points: 50 },
    { tier: 'gold', threshold: 100, points: 100 },
    { tier: 'platinum', threshold: 500, points: 200 },
    { tier: 'diamond', threshold: 2500, points: 300 },
  ],
  payx_received: [
    { tier: 'bronze', threshold: 10, points: 25 },
    { tier: 'silver', threshold: 50, points: 50 },
    { tier: 'gold', threshold: 250, points: 100 },
    { tier: 'platinum', threshold: 1000, points: 230 },
  ],
};

export const TOTAL_MILESTONE_POINTS = Object.entries(MILESTONE_CONFIG).reduce(
  (totals, [category, milestones]) => {
    totals[category as MilestoneCategory] = milestones.reduce((sum, m) => sum + m.points, 0);
    return totals;
  },
  {} as Record<MilestoneCategory, number>
);

export const GRAND_TOTAL_MILESTONE_POINTS = Object.values(TOTAL_MILESTONE_POINTS)
  .reduce((sum, pts) => sum + pts, 0);

// ============================================
// CONSISTENCY MILESTONES (V2 NEW - 925 XP total)
// Rewards users for returning over many days
// ============================================

export const CONSISTENCY_MILESTONES: ConsistencyMilestone[] = [
  { activeDays: 3, points: 15 },
  { activeDays: 7, points: 35 },
  { activeDays: 14, points: 75 },
  { activeDays: 30, points: 150 },
  { activeDays: 60, points: 250 },
  { activeDays: 90, points: 400 },
];

export const TOTAL_CONSISTENCY_POINTS = CONSISTENCY_MILESTONES.reduce(
  (sum, m) => sum + m.points, 0
); // 925 pts

// ============================================
// REFERRAL CONFIGURATION (V2 - Higher tiers)
// Tier-based decay with UNLIMITED referrals
// ============================================

export const REFERRAL_TIERS: ReferralTier[] = [
  { minReferral: 1, maxReferral: 5, pointsEach: 100 },
  { minReferral: 6, maxReferral: 15, pointsEach: 75 },
  { minReferral: 16, maxReferral: 30, pointsEach: 50 },
  { minReferral: 31, maxReferral: 50, pointsEach: 25 },
  { minReferral: 51, maxReferral: Infinity, pointsEach: 10 },
];

// Welcome bonus for applying a referral code
export const REFERRAL_WELCOME_BONUS = 50;

// Qualified bonus for referred user when they qualify
export const REFERRAL_QUALIFIED_BONUS = 100;

// Referral qualification requirements (V2 - Simplified)
export const REFERRAL_QUALIFICATION = {
  minAccountAgeHours: 24,       // 24 hours (was 48)
  minTotalVolume: 25,           // $25 (was $100)
  minProductsUsed: 2,           // 2 products (unchanged)
};

// ============================================
// SYBIL DETECTION THRESHOLDS
// ============================================

export const SYBIL_THRESHOLDS = {
  minThresholdFarming: {
    percentage: 0.8,
    minTransactions: 10,
  },
  burstActivity: {
    percentage: 0.9,
    delayDays: 7,
  },
  circularTransactions: {
    windowHours: 24,
    minAmount: 100,
  },
};

export const SYBIL_RISK_THRESHOLDS = {
  high: 50,
  medium: 25,
};

export const SYBIL_RISK_WEIGHTS = {
  minThresholdFarming: 30,
  burstActivity: 25,
  circularTransactions: 25,
  cloneBehavior: 40,
  selfReferral: 50,
};

// V2: Simple sybil penalty multipliers
export const SYBIL_PENALTY: Record<string, number> = {
  low: 1.0,      // No penalty (default)
  medium: 0.5,   // 50% penalty
  high: 0.0,     // Full penalty (zero points)
};

export function getSybilPenalty(risk: string): number {
  return SYBIL_PENALTY[risk] ?? 1.0;
}

// ============================================
// SOCIAL TASKS (V2 - 200 XP total)
// ============================================

export const SOCIAL_TASKS = {
  follow_xylonet: { points: 50, active: true },       // Follow @Xylonet_
  follow_arc: { points: 50, active: true },            // Follow @Arc_Ecosystem
  follow_payx: { points: 50, active: true },           // Follow @payx_tip
  join_discord: { points: 50, active: true },          // Join Discord
};

export const TOTAL_SOCIAL_POINTS = Object.entries(SOCIAL_TASKS)
  .filter(([, config]) => config.active)
  .reduce((sum, [, config]) => sum + config.points, 0); // 200 pts

// ============================================
// BLOCKCHAIN CONFIGURATION
// ============================================

export const BLOCKCHAIN_CONFIG = {
  deploymentBlock: 17100000n,
  chunkSize: 10000n,
  maxRetries: 3,
  retryDelayMs: 500,
};

// ============================================
// PROCESSING CONFIGURATION
// ============================================

export const PROCESSING_CONFIG = {
  batchSize: 100,
  maxProcessingTimeMs: 55000,
  cronSchedule: '0 0 * * *',       // Daily at midnight UTC
  blocksPerRun: 1000000n,
};

// ============================================
// HELPER: Get referral points for Nth referral
// ============================================

export function getReferralPoints(referralNumber: number): number {
  const tier = REFERRAL_TIERS.find(
    t => referralNumber >= t.minReferral && referralNumber <= t.maxReferral
  );
  return tier?.pointsEach ?? 10;
}

// ============================================
// HELPER: Get milestone for category and volume
// ============================================

export function getAchievableMilestones(
  category: MilestoneCategory,
  currentVolume: number,
  achievedTiers: string[]
): MilestoneConfig[] {
  const milestones = MILESTONE_CONFIG[category] || [];
  return milestones.filter(
    m => currentVolume >= m.threshold && !achievedTiers.includes(m.tier)
  );
}

// ============================================
// SUMMARY: TOTAL POSSIBLE POINTS (V2)
// ============================================

export const MAX_POSSIBLE_POINTS = {
  firstInteractions: TOTAL_FIRST_INTERACTION_POINTS,       // 350
  milestones: GRAND_TOTAL_MILESTONE_POINTS,                // 3,125
  consistency: TOTAL_CONSISTENCY_POINTS,                    // 925
  social: TOTAL_SOCIAL_POINTS,                             // 200
  referrals: 'Unlimited (diminishing returns)',
  volume: 'Unlimited (logarithmic scaling, diversity multiplier)',
};

export const POINTS_SUMMARY = {
  firstInteractionsTotal: TOTAL_FIRST_INTERACTION_POINTS,
  milestonesTotal: GRAND_TOTAL_MILESTONE_POINTS,
  consistencyTotal: TOTAL_CONSISTENCY_POINTS,
  socialTotal: TOTAL_SOCIAL_POINTS,
};
