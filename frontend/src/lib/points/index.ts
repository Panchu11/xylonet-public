// ============================================
// XYLONET POINTS SYSTEM V2 - EXPORTS
// ============================================

// Types
export * from './types';

// Configuration
export {
  PRODUCT_CONFIG,
  DIVERSITY_CONFIG,
  getDiversityMultiplier,
  FIRST_INTERACTION_CONFIG,
  TOTAL_FIRST_INTERACTION_POINTS,
  MILESTONE_CONFIG,
  TOTAL_MILESTONE_POINTS,
  GRAND_TOTAL_MILESTONE_POINTS,
  CONSISTENCY_MILESTONES,
  TOTAL_CONSISTENCY_POINTS,
  REFERRAL_TIERS,
  REFERRAL_WELCOME_BONUS,
  REFERRAL_QUALIFIED_BONUS,
  REFERRAL_QUALIFICATION,
  SYBIL_THRESHOLDS,
  SYBIL_RISK_THRESHOLDS,
  SYBIL_RISK_WEIGHTS,
  SYBIL_PENALTY,
  getSybilPenalty,
  SOCIAL_TASKS,
  TOTAL_SOCIAL_POINTS,
  BLOCKCHAIN_CONFIG,
  PROCESSING_CONFIG,
  getReferralPoints,
  getAchievableMilestones,
  MAX_POSSIBLE_POINTS,
  POINTS_SUMMARY,
} from './config';

// Calculator
export {
  calculateLogPoints,
  calculateVolumePoints,
  calculateDiversityMultiplier,
  calculateFirstInteractionPoints,
  qualifiesForFirstInteraction,
  getFirstInteractionPoints,
  calculateMilestonePoints,
  calculateAllMilestonePoints,
  checkMilestones,
  calculateConsistencyPoints,
  calculateReferralPointsForReferrer,
  calculateTotalReferralPoints,
  applySybilPenalty,
  calculateTotalPoints,
  filterValidTransactions,
  aggregateValidVolume,
  generateVolumeExamples,
} from './calculator';

// Sybil Detection
export {
  detectMinThresholdFarming,
  detectBurstActivity,
  detectCircularTransactions,
  analyzeSybilRisk,
  getSybilPenaltyMultiplier,
  getSybilStatusDisplay,
} from './quality-score';

// Blockscout API
export {
  CONTRACTS,
  PAYX_CONTRACT,
  EVENT_TOPICS,
  fetchSwapEventsBlockscout,
  fetchVaultEventsBlockscout,
  fetchPayXTipEventsBlockscout,
  fetchAllEventsBlockscout,
  getCurrentBlockNumber,
} from './blockscout';

// Data Import & Aggregation
export {
  recalculateAllPoints,
  fullRebuildV2,
  incrementalUpdate,
} from './goldsky-import';

// Referrals
export {
  isValidReferralCode,
  referralCodeExists,
  applyReferralCode,
  calculateQualificationProgress,
  isFullyQualified,
  updateReferralQualification,
  awardReferralPoints,
  getReferralStats,
  getUserReferrals,
  getPendingReferrals,
  processAllPendingReferrals,
  getReferralTierInfo,
} from './referrals';

// Processor
export {
  processPoints,
  getProcessingState,
  getProcessingStats,
} from './processor';
