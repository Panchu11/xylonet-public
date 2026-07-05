// ═══════════════════════════════════════════════════════════════════════════
// PayX Twitter Bot - TypeScript Types & Interfaces
// ═══════════════════════════════════════════════════════════════════════════

import { PayXTip } from '@/lib/payx-supabase';

// ═══════════════════════════════════════════════════════════════════════════
// DATABASE TYPES
// ═══════════════════════════════════════════════════════════════════════════

export type PostType = 
  | 'individual'        // Single tip post
  | 'batch'            // Batch summary (4-hour window)
  | 'hourly'           // Hourly summary (DEPRECATED)
  | 'daily'            // Daily recap
  | 'weekly'           // Weekly leaderboard
  | 'milestone'        // Milestone celebration
  | 'first_time'       // First-time recipient
  | 'ultra_whale'      // $100+ tip
  | 'whale';           // $50-99 tip

export type Priority = 'high' | 'medium' | 'low';

export type PostStatus = 'posted' | 'failed' | 'skipped';

export interface BotPost {
  id: string;
  tip_id: string | null;
  tx_hash: string | null;
  tweet_id: string | null;
  post_type: PostType;
  priority: Priority | null;
  tweet_text: string;
  char_count: number;
  status: PostStatus;
  error_message: string | null;
  posted_at: string;
  created_at: string;
}

export interface BotConfig {
  key: string;
  value: string;
  description: string | null;
  updated_at: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// BOT OPERATION TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface UnpostedTip {
  tip_id: string;
  tx_hash: string;
  from_address: string;
  to_handle: string;
  amount: number;
  message: string | null;
  timestamp: string;
}

export interface TipWithPriority extends UnpostedTip {
  priority: Priority;
  score: number; // For sorting
  isFirstTime: boolean;
  tipType: 'ultra_whale' | 'whale' | 'first_time' | 'batch';
}

export interface DailyQuota {
  used: number;
  limit: number;
  remaining: number;
  percentage: number;
}

export interface PostBudget {
  batch_summaries: number;    // 6 - Every 4 hours
  ultra_whale: number;        // 3 - $100+ tips
  whale: number;              // 4 - $50-99 tips
  first_time: number;         // 2 - $25+ first-time
  daily_recap: number;        // 1 - Midnight UTC
  milestones: number;         // 1 - When triggered
  total: number;              // 17
}

// ═══════════════════════════════════════════════════════════════════════════
// TWEET TEMPLATE TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface IndividualTweetData {
  handle: string;
  amount: number;
  message: string | null;
  from_address: string;
  total_volume: number;
  tips_today: number;
  claim_url: string;
}

export interface HourlySummaryData {
  hour: string;
  tips_count: number;
  total_amount: number;
  top_recipient: string;
  top_amount: number;
  claim_url: string;
}

export interface BatchSummaryData {
  window_start: string;  // ISO timestamp
  window_end: string;    // ISO timestamp
  window_hours: number;  // 4
  all_recipients: Array<{ handle: string; amount: number }>;  // ALL recipients (long-form)
  total_tips: number;
  claim_url: string;
}

// Whale batch data ($50-99 tips)
export interface WhaleBatchData {
  window_hours: number;
  tips: Array<{
    handle: string;
    amount: number;
    message: string | null;
  }>;
  total_tips: number;
  claim_url: string;
}

// Ultra-whale batch data ($100+ tips)
export interface UltraWhaleBatchData {
  window_hours: number;
  tips: Array<{
    handle: string;
    amount: number;
    message: string | null;
  }>;
  total_tips: number;
  claim_url: string;
}

// First-time recipient batch data
export interface FirstTimeBatchData {
  window_hours: number;
  recipients: Array<{
    handle: string;
    amount: number;
  }>;
  total_recipients: number;
  claim_url: string;
}

export interface DailyRecapData {
  date: string;
  total_tips: number;
  total_volume: number;
  unique_senders: number;
  unique_recipients: number;
  top_recipients: Array<{ handle: string; amount: number }>;
  claim_url: string;
}

export interface WeeklyLeaderboardData {
  week: string;
  total_tips: number;
  total_creators: number;
  top_recipients: Array<{ handle: string; amount: number }>;  // Only creators, no wallet addresses
  total_volume: number;
  claim_url: string;
}

export interface MilestoneData {
  type: 'tips' | 'volume';
  milestone: number;
  current: number;
  claim_url: string;
}

export interface FirstTimeTweetData {
  handle: string;
  amount: number;
  from_address: string;
  message: string | null;
  claim_url: string;
}

export type TweetData = 
  | IndividualTweetData
  | BatchSummaryData
  | HourlySummaryData
  | DailyRecapData
  | WeeklyLeaderboardData
  | MilestoneData
  | FirstTimeTweetData;

// ═══════════════════════════════════════════════════════════════════════════
// API RESPONSE TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface BotStatusResponse {
  enabled: boolean;
  dry_run: boolean;
  daily_quota: DailyQuota;
  last_post: BotPost | null;
  today_stats: {
    total_posts: number;
    by_type: Record<PostType, number>;
    by_status: Record<PostStatus, number>;
  };
  config: Record<string, string>;
}

export interface PostResponse {
  success: boolean;
  tweet_id?: string;
  tweet_text?: string;
  error?: string;
  dry_run?: boolean;
}

export interface CronRunResult {
  success: boolean;
  dry_run: boolean;
  quota_before: number;
  quota_after: number;
  processed: {
    batch_summaries: number;
    ultra_whale_tips: number;
    whale_tips: number;
    daily_recaps: number;
    milestones: number;
    first_time: number;
  };
  posted: number;
  failed: number;
  skipped: number;
  errors: string[];
  duration_ms: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// TWITTER API TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface TwitterRateLimit {
  limit: number;
  remaining: number;
  reset: number; // Unix timestamp
}

export interface TwitterPostResult {
  success: boolean;
  tweet_id?: string;
  error?: string;
  rate_limit?: TwitterRateLimit;
}

// ═══════════════════════════════════════════════════════════════════════════
// CONFIGURATION TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface BotRuntimeConfig {
  bot_enabled: boolean;
  dry_run_mode: boolean;
  max_posts_per_day: number;
  high_priority_min_amount: number;
  medium_priority_min_amount: number;
  claim_url: string;
  timezone: string;
  cron_interval_minutes: number;
}

export const DEFAULT_BOT_CONFIG: BotRuntimeConfig = {
  bot_enabled: false,
  dry_run_mode: true,
  max_posts_per_day: 17, // X Free tier: 17 tweets/24hrs
  high_priority_min_amount: 10,
  medium_priority_min_amount: 5,
  claim_url: 'https://xylonet.xyz/payx/claim',
  timezone: 'UTC',
  cron_interval_minutes: 10,
};

// ═══════════════════════════════════════════════════════════════════════════
// UTILITY TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface ProcessingQueue {
  high_priority: TipWithPriority[];
  medium_priority: TipWithPriority[];
  low_priority: TipWithPriority[];
  first_time: TipWithPriority[];
}

export interface PostingPlan {
  batch_summary: boolean;
  whale_batch: boolean;       // $50-99 tips batch
  ultra_whale_batch: boolean; // $100+ tips batch
  first_time_batch: boolean;  // First-time recipients batch
  daily_recap: boolean;
  milestone: MilestoneData | null;
  total_planned: number;
}
