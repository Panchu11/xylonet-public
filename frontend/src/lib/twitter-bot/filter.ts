// ═══════════════════════════════════════════════════════════════════════════
// PayX Twitter Bot - Priority Filter (X Free Tier: 17 posts/day)
// FAIL-SAFE: Tips expire after 2 hours, only highest amounts posted
// ═══════════════════════════════════════════════════════════════════════════

import type {
  UnpostedTip,
  TipWithPriority,
  Priority,
  ProcessingQueue,
  PostingPlan,
  BotRuntimeConfig,
  PostBudget,
  DailyQuota,
} from './types';
import { createClient } from '@supabase/supabase-js';

// Service role client for bot operations (bypasses RLS)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
  : null;

function getSupabase() {
  if (!supabase) throw new Error('[Bot Filter] Supabase service role not configured');
  return supabase;
}

// ═══════════════════════════════════════════════════════════════════════════
// RATE LIMIT CONSTANTS (X Free Tier)
// Official limit: 17 tweets per 24 hours
// NEW STRATEGY: Batch-First Approach
// ═══════════════════════════════════════════════════════════════════════════

const DAILY_TWEET_LIMIT = 17;
const MAX_POSTS_PER_RUN = 3;        // Max tweets per cron run (every 10 min)
const BATCH_INTERVAL_HOURS = 4;     // Batch summary every 4 hours
const ULTRA_WHALE_THRESHOLD = 100;  // $100+ gets immediate individual tweet
const WHALE_THRESHOLD = 50;         // $50-99 gets individual tweet
const FIRST_TIME_THRESHOLD = 25;    // First-time with $25+ gets individual tweet

const POST_BUDGET: PostBudget = {
  batch_summaries: 6,     // Every 4 hours = 6 per day
  ultra_whale: 3,         // $100+ tips (replaces reserved)
  whale: 4,               // $50-99 tips
  first_time: 2,          // $25+ first-time recipients
  daily_recap: 1,         // Once at midnight UTC
  milestones: 1,          // When triggered (rare)
  total: DAILY_TWEET_LIMIT,
};

// ═══════════════════════════════════════════════════════════════════════════
// PRIORITY CALCULATION
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Calculate priority for a tip
 * NEW STRATEGY:
 * - $100+ = Ultra-whale (immediate tweet)
 * - $50-99 = Whale (immediate tweet)
 * - $25+ first-time = Individual tweet
 * - Everything else = Batch summary
 */
export function calculateTipPriority(
  tip: UnpostedTip,
  config: BotRuntimeConfig,
  isFirstTime: boolean
): { priority: Priority; score: number; tipType: 'ultra_whale' | 'whale' | 'batch' | 'first_time' } {
  const amount = tip.amount;

  // ULTRA-WHALE: $100+
  if (amount >= ULTRA_WHALE_THRESHOLD) {
    return { priority: 'high', score: amount * 1000, tipType: 'ultra_whale' };
  }

  // WHALE: $50-99
  if (amount >= WHALE_THRESHOLD) {
    return { priority: 'high', score: amount * 100, tipType: 'whale' };
  }

  // FIRST-TIME: $25+ and first tip to this handle
  if (isFirstTime && amount >= FIRST_TIME_THRESHOLD) {
    return { priority: 'high', score: amount * 50 + 1000, tipType: 'first_time' };
  }

  // Everything else goes to batch summary
  return { priority: 'low', score: amount, tipType: 'batch' };
}

/**
 * Check if recipient is receiving first-time tip
 * @param handle X handle
 * @returns True if this would be their first tip
 */
export async function isFirstTimeTip(handle: string): Promise<boolean> {
  try {
    const { data, error } = await getSupabase()
      .from('payx_tips')
      .select('id')
      .eq('to_handle', handle.toLowerCase())
      .limit(1);

    if (error) throw error;
    return !data || data.length === 0;
  } catch (error) {
    console.error('[BotFilter] Error checking first-time tip:', error);
    return false; // Fail safe: treat as not first-time
  }
}

/**
 * Enrich tips with priority information
 * NEW STRATEGY: No expiry - all tips appear in batch summaries
 * @param tips Array of unposted tips
 * @param config Runtime configuration
 * @returns Tips with priority and scoring
 */
export async function enrichTipsWithPriority(
  tips: UnpostedTip[],
  config: BotRuntimeConfig
): Promise<TipWithPriority[]> {
  const enriched: TipWithPriority[] = [];

  for (const tip of tips) {
    const isFirstTime = await isFirstTimeTip(tip.to_handle);
    const { priority, score, tipType } = calculateTipPriority(tip, config, isFirstTime);

    enriched.push({
      ...tip,
      priority,
      score,
      isFirstTime,
      tipType,
    });
  }

  // Sort by score (highest first)
  return enriched.sort((a, b) => b.score - a.score);
}

/**
 * Mark a tip as expired (won't be posted individually)
 */
async function markTipAsExpired(txHash: string): Promise<void> {
  try {
    await getSupabase()
      .from('payx_bot_posts')
      .upsert({
        tx_hash: txHash,
        post_type: 'individual',
        status: 'skipped',
        skip_reason: 'expired',
        created_at: new Date().toISOString(),
      }, { onConflict: 'tx_hash' });
  } catch (error) {
    console.error('[BotFilter] Error marking tip as expired:', error);
  }
}

/**
 * Mark a tip as low priority (won't be posted individually)
 */
async function markTipAsLowPriority(txHash: string): Promise<void> {
  try {
    await getSupabase()
      .from('payx_bot_posts')
      .upsert({
        tx_hash: txHash,
        post_type: 'individual',
        status: 'skipped',
        skip_reason: 'low_priority',
        created_at: new Date().toISOString(),
      }, { onConflict: 'tx_hash' });
  } catch (error) {
    console.error('[BotFilter] Error marking tip as low priority:', error);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// QUEUE MANAGEMENT
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Organize tips by type for posting plan
 * @param tips Tips with priority
 * @returns Organized by tip type
 */
export function organizeTipsByType(tips: TipWithPriority[]): {
  ultra_whale: TipWithPriority[];
  whale: TipWithPriority[];
  first_time: TipWithPriority[];
  batch: TipWithPriority[];
} {
  return {
    ultra_whale: tips.filter(t => t.tipType === 'ultra_whale'),
    whale: tips.filter(t => t.tipType === 'whale'),
    first_time: tips.filter(t => t.tipType === 'first_time'),
    batch: tips.filter(t => t.tipType === 'batch'),
  };
}

/**
 * Get current daily quota usage
 * @returns Quota information
 */
export async function getDailyQuota(maxPosts: number): Promise<DailyQuota> {
  try {
    const { data, error } = await getSupabase().rpc('get_today_bot_post_count');

    if (error) throw error;

    const used = data || 0;
    const remaining = Math.max(0, maxPosts - used);

    return {
      used,
      limit: maxPosts,
      remaining,
      percentage: (used / maxPosts) * 100,
    };
  } catch (error) {
    console.error('[BotFilter] Error getting daily quota:', error);
    return {
      used: 0,
      limit: maxPosts,
      remaining: maxPosts,
      percentage: 0,
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// POSTING PLAN CREATION (BATCH-ONLY STRATEGY)
// All tips go to batches - no individual tweets
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Create posting plan within daily quota
 * ALL BATCH STRATEGY:
 * - All batches post at: 00:00, 04:00, 08:00, 12:00, 16:00, 20:00 UTC
 * - Batch summary: ALL tips in window
 * - Whale batch: $50-99 tips in window
 * - Ultra-whale batch: $100+ tips in window
 * - First-time batch: First-time recipients in window
 * - Daily recap: Once at midnight UTC
 * - Milestones: When triggered
 */
export function createPostingPlan(
  tipsByType: {
    ultra_whale: TipWithPriority[];
    whale: TipWithPriority[];
    first_time: TipWithPriority[];
    batch: TipWithPriority[];
  },
  quota: DailyQuota,
  includeBatchSummary: boolean = false,
  includeDailyRecap: boolean = false
): PostingPlan {
  const plan: PostingPlan = {
    batch_summary: false,
    whale_batch: false,
    ultra_whale_batch: false,
    first_time_batch: false,
    daily_recap: false,
    milestone: null,
    total_planned: 0,
  };

  if (quota.remaining <= 0) {
    console.log('[BotFilter] Daily quota exhausted, skipping all posts');
    return plan;
  }

  let perRunBudget = Math.min(quota.remaining, MAX_POSTS_PER_RUN);
  console.log(`[BotFilter] Per-run budget: ${perRunBudget} (daily remaining: ${quota.remaining})`);

  // 1. Daily recap (midnight UTC) - highest priority
  if (includeDailyRecap && perRunBudget > 0) {
    plan.daily_recap = true;
    perRunBudget--;
  }

  // 2. All batches post at the same 4-hour windows
  // They all use the same time check (shouldPostBatchSummary)
  
  // Batch summary (all tips)
  if (includeBatchSummary && perRunBudget > 0) {
    plan.batch_summary = true;
    perRunBudget--;
  }

  // Ultra-whale batch ($100+ tips)
  if (includeBatchSummary && perRunBudget > 0 && tipsByType.ultra_whale.length > 0) {
    plan.ultra_whale_batch = true;
    perRunBudget--;
  }

  // Whale batch ($50-99 tips)
  if (includeBatchSummary && perRunBudget > 0 && tipsByType.whale.length > 0) {
    plan.whale_batch = true;
    perRunBudget--;
  }

  // First-time batch
  if (includeBatchSummary && perRunBudget > 0 && tipsByType.first_time.length > 0) {
    plan.first_time_batch = true;
    perRunBudget--;
  }

  // Calculate total
  plan.total_planned =
    (plan.batch_summary ? 1 : 0) +
    (plan.whale_batch ? 1 : 0) +
    (plan.ultra_whale_batch ? 1 : 0) +
    (plan.first_time_batch ? 1 : 0) +
    (plan.daily_recap ? 1 : 0);

  console.log(
    `[BotFilter] Plan: ${plan.total_planned} posts (` +
    `batch=${plan.batch_summary ? 1 : 0}, ` +
    `ultra_whale=${plan.ultra_whale_batch ? 1 : 0}, ` +
    `whale=${plan.whale_batch ? 1 : 0}, ` +
    `first_time=${plan.first_time_batch ? 1 : 0}, ` +
    `recap=${plan.daily_recap ? 1 : 0})`
  );
  
  return plan;
}

/**
 * Check if we should post hourly summary
 * DEPRECATED - Use shouldPostBatchSummary instead
 */
export function shouldPostHourlySummary(
  lastHourlySummaryTime: Date | null,
  intervalMinutes: number = 180
): boolean {
  if (!lastHourlySummaryTime) return true;
  const now = new Date();
  const minutesSinceLastSummary = 
    (now.getTime() - lastHourlySummaryTime.getTime()) / (1000 * 60);
  return minutesSinceLastSummary >= intervalMinutes;
}

/**
 * Check if we should post batch summary
 * Batch summaries post at: 04:00, 08:00, 12:00, 16:00, 20:00, 00:00 UTC
 * Uses TWO timestamps: last successful post and last attempted post (including failures)
 * - Retries within a window if previous attempt failed (every 10 min)
 * - Skips window only if a SUCCESSFUL post exists in it
 * - Fallback: if no successful post in 6+ hours, force a post at any hour
 * @param lastSuccessTime Last time a batch was SUCCESSFULLY posted (or null)
 * @param lastAttemptTime Last time a batch was attempted (success or fail, or null)
 * @returns True if we should post a batch summary now
 */
export function shouldPostBatchSummary(
  lastSuccessTime: Date | null,
  lastAttemptTime?: Date | null
): boolean {
  const now = new Date();
  const hourUTC = now.getUTCHours();
  
  // Batch windows: hours 0, 4, 8, 12, 16, 20
  const batchHours = [0, 4, 8, 12, 16, 20];
  const isBatchHour = batchHours.includes(hourUTC);

  // FALLBACK: If no successful post in 6+ hours, force a post at any hour
  if (lastSuccessTime) {
    const hoursSinceSuccess = (now.getTime() - lastSuccessTime.getTime()) / (1000 * 60 * 60);
    if (hoursSinceSuccess >= 6) {
      // Check if we attempted recently (within 10 min) to avoid spam on persistent errors
      if (lastAttemptTime) {
        const minsSinceAttempt = (now.getTime() - lastAttemptTime.getTime()) / (1000 * 60);
        if (minsSinceAttempt < 10) return false; // Wait at least 10 min between retries
      }
      return true; // Force a post - we're overdue
    }
  } else if (!lastSuccessTime) {
    // Never posted successfully before - should post now (with attempt cooldown)
    if (lastAttemptTime) {
      const minsSinceAttempt = (now.getTime() - lastAttemptTime.getTime()) / (1000 * 60);
      if (minsSinceAttempt < 10) return false;
    }
    return isBatchHour;
  }

  if (!isBatchHour) return false;

  // Check if we already SUCCESSFULLY posted in this window
  const hoursSinceSuccess = (now.getTime() - lastSuccessTime.getTime()) / (1000 * 60 * 60);
  if (hoursSinceSuccess < 3.5) return false; // Already posted in this window

  // We haven't posted successfully in this window yet.
  // Check if we attempted recently (failed) - allow retry after 10 min cooldown
  if (lastAttemptTime) {
    const minsSinceAttempt = (now.getTime() - lastAttemptTime.getTime()) / (1000 * 60);
    if (minsSinceAttempt < 10) return false; // Wait between retries
  }

  return true;
}

/**
 * Check if we should post daily recap
 * Posts during midnight UTC window (00:00-02:00 UTC) or as fallback if missed
 * @param today Today's date (YYYY-MM-DD)
 * @param lastDailyRecapDate Last date recap was SUCCESSFULLY posted (YYYY-MM-DD)
 * @param lastAttemptTime Last attempt time (success or fail, for retry cooldown)
 * @returns True if daily recap should be posted
 */
export function shouldPostDailyRecap(
  today: string, // Format: 'YYYY-MM-DD'
  lastDailyRecapDate: string | null,
  lastAttemptTime?: Date | null
): boolean {
  // Only post if we haven't successfully posted today
  if (lastDailyRecapDate === today) return false;
  
  const nowUTC = new Date();
  const hourUTC = nowUTC.getUTCHours();
  
  // Check retry cooldown - don't attempt more than once per 10 minutes
  if (lastAttemptTime) {
    const minsSinceAttempt = (nowUTC.getTime() - lastAttemptTime.getTime()) / (1000 * 60);
    if (minsSinceAttempt < 10) return false;
  }
  
  // Primary window: 00:00 - 02:00 UTC (expanded from just hour 0)
  if (hourUTC <= 1) return true;
  
  // Fallback: if it's past the window but recap wasn't posted yesterday either,
  // allow posting at the next batch hour
  if (lastDailyRecapDate) {
    const lastDate = new Date(lastDailyRecapDate + 'T00:00:00Z');
    const todayDate = new Date(today + 'T00:00:00Z');
    const daysSince = (todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24);
    if (daysSince >= 2) {
      // Missed recap for 2+ days - post at next batch hour
      const batchHours = [0, 4, 8, 12, 16, 20];
      return batchHours.includes(hourUTC);
    }
  } else {
    // Never posted a daily recap - allow at batch hours
    const batchHours = [0, 4, 8, 12, 16, 20];
    return batchHours.includes(hourUTC);
  }
  
  return false;
}

/**
 * Check if we should post weekly leaderboard
 * Only posts on Monday at midnight UTC (00:00-01:00 UTC)
 * @param today Current date (UTC)
 * @param lastWeeklyLeaderboardDate Last date leaderboard was posted
 * @returns True if it's Monday midnight UTC and hasn't been posted this week
 */
export function shouldPostWeeklyLeaderboard(
  today: Date,
  lastWeeklyLeaderboardDate: Date | null
): boolean {
  // Only post on Mondays (day 1)
  if (today.getUTCDay() !== 1) return false;
  
  // Only post during midnight UTC window (00:00 - 01:00 UTC)
  const hourUTC = today.getUTCHours();
  if (hourUTC !== 0) return false;

  if (!lastWeeklyLeaderboardDate) return true;

  // Check if it's been posted this week
  const daysSinceLastPost = 
    (today.getTime() - lastWeeklyLeaderboardDate.getTime()) / (1000 * 60 * 60 * 24);

  return daysSinceLastPost >= 7;
}

/**
 * Get last SUCCESSFUL post time by type
 * @param postType Type of post
 * @returns Last successful post time or null
 */
export async function getLastPostTime(postType: string): Promise<Date | null> {
  try {
    const { data, error } = await getSupabase()
      .from('payx_bot_posts')
      .select('posted_at')
      .eq('post_type', postType)
      .eq('status', 'posted')  // Only successful posts
      .order('posted_at', { ascending: false })
      .limit(1)
      .single();

    if (error || !data) return null;

    return new Date(data.posted_at);
  } catch {
    return null;
  }
}

/**
 * Get last ATTEMPTED post time by type (includes failed posts)
 * Used for retry cooldown to avoid hammering a broken API
 * @param postType Type of post
 * @returns Last attempt time or null
 */
export async function getLastAttemptTime(postType: string): Promise<Date | null> {
  try {
    const { data, error } = await getSupabase()
      .from('payx_bot_posts')
      .select('posted_at')
      .eq('post_type', postType)
      .in('status', ['posted', 'failed'])
      .order('posted_at', { ascending: false })
      .limit(1)
      .single();

    if (error || !data) return null;

    return new Date(data.posted_at);
  } catch {
    return null;
  }
}
