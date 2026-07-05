// ============================================
// XYLONET POINTS SYSTEM V2 - TYPE DEFINITIONS
// ============================================

// ============================================
// PRODUCT TYPES
// ============================================

export type ProductType = 'swap' | 'vault' | 'payx_sent' | 'payx_received';

export type InteractionType =
  | 'first_swap'
  | 'first_vault'
  | 'first_payx_tip'
  | 'first_payx_claim';

export type MilestoneTier = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond' | 'legendary';

export type MilestoneCategory = 'swap' | 'vault' | 'payx_sent' | 'payx_received';

export type ReferralStatus = 'pending' | 'qualified' | 'rejected';

export type SybilRisk = 'low' | 'medium' | 'high';

export type PointsCategory =
  | 'volume'
  | 'milestone'
  | 'first_interaction'
  | 'consistency'
  | 'referral'
  | 'social'
  | 'adjustment';

// ============================================
// CONFIGURATION TYPES
// ============================================

export interface ProductConfig {
  baseVolume: number;      // Base volume for log calculation
  multiplier: number;      // Points multiplier (v2: 5x higher)
  minTxVolume: number;     // Minimum transaction volume to count
}

export interface FirstInteractionConfig {
  points: number;
  minVolume: number;
}

export interface MilestoneConfig {
  tier: MilestoneTier;
  threshold: number;       // Volume threshold
  points: number;          // Points awarded
}

export interface ConsistencyMilestone {
  activeDays: number;      // Required active days
  points: number;          // Points awarded
}

export interface DiversityConfig {
  products1: number;       // Multiplier for 1 product
  products2: number;       // Multiplier for 2 products
  products3Plus: number;   // Multiplier for 3+ products
}

export interface ReferralTier {
  minReferral: number;
  maxReferral: number;
  pointsEach: number;
}

// ============================================
// USER TYPES
// ============================================

export interface UserPointsData {
  id: string;
  wallet_address: string;
  total_points: number;
  volume_points: number;
  milestone_points: number;
  first_interaction_points: number;
  consistency_points: number;
  referral_points: number;
  social_points: number;
  diversity_multiplier: number;
  sybil_risk: SybilRisk;
  referral_code: string;
  referred_by_code: string | null;
  successful_referrals: number;
  cumulative_swap_volume: number;
  cumulative_vault_volume: number;
  cumulative_payx_sent: number;
  cumulative_payx_received: number;
  swap_count: number;
  vault_deposit_count: number;
  payx_sent_count: number;
  payx_claim_count: number;
  products_used: number;
  active_days: number;
  active_dates_json: string[] | null;
  first_activity_at: string | null;
  last_activity_at: string | null;
  created_at: string;
}

export interface UserRank extends UserPointsData {
  rank: number;
}

// ============================================
// FIRST INTERACTION TYPES
// ============================================

export interface FirstInteraction {
  id: string;
  user_id: string;
  interaction_type: InteractionType;
  points_awarded: number;
  tx_hash: string | null;
  volume: number | null;
  completed_at: string;
}

// ============================================
// MILESTONE TYPES
// ============================================

export interface VolumeMilestone {
  id: string;
  user_id: string;
  category: MilestoneCategory;
  tier: MilestoneTier;
  threshold_volume: number;
  points_awarded: number;
  achieved_at: string;
}

// ============================================
// REFERRAL TYPES
// ============================================

export interface QualificationProgress {
  account_age_hours: number;
  total_volume: number;
  products_used: number;
  requirements_met: {
    age: boolean;
    volume: boolean;
    products: boolean;
  };
}

export interface Referral {
  id: string;
  referrer_id: string;
  referred_id: string;
  referral_code: string;
  status: ReferralStatus;
  qualification_progress: QualificationProgress;
  referred_at: string;
  qualified_at: string | null;
  referrer_points_awarded: number;
  referred_points_awarded: number;
  rejection_reason: string | null;
}

export interface ReferralStats {
  total_referrals: number;
  qualified_referrals: number;
  pending_referrals: number;
  total_points_earned: number;
  referral_code: string;
}

// ============================================
// POINTS LEDGER TYPES
// ============================================

export interface PointsLedgerEntry {
  id: string;
  user_id: string;
  points_change: number;
  reason: string;
  category: PointsCategory;
  reference_id: string | null;
  balance_after: number | null;
  created_at: string;
}

// ============================================
// PROCESSING TYPES
// ============================================

export interface ProcessingState {
  id: string;
  last_processed_block: number;
  last_processed_at: string | null;
  status: 'idle' | 'running' | 'error';
  error_message: string | null;
  events_processed: number;
  points_awarded: number;
  updated_at: string;
}

// ============================================
// BLOCKCHAIN EVENT TYPES
// ============================================

export interface SwapEvent {
  txHash: string;
  sender: string;
  tokenIn: string;
  tokenOut: string;
  amountIn: bigint;
  amountOut: bigint;
  to: string;
  blockNumber: bigint;
  timestamp: number;
}

export interface VaultEvent {
  txHash: string;
  sender: string;
  owner: string;
  assets: bigint;
  shares: bigint;
  blockNumber: bigint;
  timestamp: number;
  eventType: 'deposit' | 'withdraw';
}

export interface PayXTipEvent {
  txHash: string;
  handle: string;
  tipper: string;
  amount: bigint;
  fee: bigint;
  message: string;
  blockNumber: bigint;
  timestamp: number;
}

// ============================================
// AGGREGATED TYPES (V2)
// ============================================

export interface WalletAggregatedData {
  wallet: string;
  swapVolume: number;
  swapCount: number;
  vaultVolume: number;
  vaultCount: number;
  payxSentVolume: number;
  payxSentCount: number;
  payxReceivedVolume: number;
  payxClaimCount: number;
  activeDates: Set<string>;  // UTC date strings
}

// ============================================
// SYBIL DETECTION TYPES
// ============================================

export interface SybilIndicators {
  minThresholdFarming: boolean;
  burstActivity: boolean;
  circularTransactions: boolean;
  cloneBehavior: boolean;
  selfReferral: boolean;
}

export interface SybilAnalysis {
  riskLevel: SybilRisk;
  riskScore: number;
  indicators: SybilIndicators;
  flags: string[];
}

// ============================================
// V2 CALCULATION RESULT
// ============================================

export interface V2PointsCalculation {
  wallet: string;
  volumePoints: {
    swap: number;
    vault: number;
    payx_sent: number;
    payx_received: number;
    raw_total: number;
  };
  diversityMultiplier: number;
  adjustedVolumePoints: number;
  milestonePoints: number;
  firstInteractionPoints: number;
  consistencyPoints: number;
  referralPoints: number;
  socialPoints: number;
  sybilMultiplier: number;
  totalPoints: number;
}

// ============================================
// API RESPONSE TYPES
// ============================================

export interface PointsApiResponse {
  success: boolean;
  data?: UserPointsData;
  error?: string;
}

export interface LeaderboardApiResponse {
  success: boolean;
  data?: UserRank[];
  total?: number;
  error?: string;
}

export interface ReferralApiResponse {
  success: boolean;
  data?: {
    referral_code: string;
    stats: ReferralStats;
    referrals: Referral[];
  };
  error?: string;
}

export interface ProcessPointsApiResponse {
  success: boolean;
  data?: {
    events_processed: number;
    points_awarded: number;
    users_updated: number;
    processing_time_ms: number;
  };
  error?: string;
}
