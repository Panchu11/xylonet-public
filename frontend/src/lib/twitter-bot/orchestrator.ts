// ═══════════════════════════════════════════════════════════════════════════
// PayX Twitter Bot - Core Orchestrator
// Main bot logic that coordinates all components
// ═══════════════════════════════════════════════════════════════════════════

import type { CronRunResult } from './types';
import { getTwitterClient, validateTwitterCredentials } from './client';
import {
  enrichTipsWithPriority,
  organizeTipsByType,
  getDailyQuota,
  createPostingPlan,
  shouldPostBatchSummary,
  shouldPostDailyRecap,
  getLastPostTime,
  getLastAttemptTime,
} from './filter';
import {
  formatBatchSummaryTweet,
  formatWhaleBatchTweet,
  formatUltraWhaleBatchTweet,
  formatFirstTimeBatchTweet,
  formatDailyRecapTweet,
  formatMilestoneTweet,
} from './formatter';
import {
  getBotConfig,
  getUnpostedTips,
  recordPost,
  getTodayPostCount,
  getRateLimitStatus,
} from './tracker';
import { createClient } from '@supabase/supabase-js';

// Service role client for stats query
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
  : null;

function getSupabase() {
  if (!supabase) throw new Error('[Bot Orchestrator] Supabase not configured');
  return supabase;
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN BOT RUNNER
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Main bot execution function - Called by cron job
 * @returns Execution result
 */
export async function runBot(): Promise<CronRunResult> {
  const startTime = Date.now();
  const result: CronRunResult = {
    success: false,
    dry_run: false,
    quota_before: 0,
    quota_after: 0,
    processed: {
      batch_summaries: 0,
      ultra_whale_tips: 0,
      whale_tips: 0,
      daily_recaps: 0,
      milestones: 0,
      first_time: 0,
    },
    posted: 0,
    failed: 0,
    skipped: 0,
    errors: [],
    duration_ms: 0,
  };

  try {
    console.log('[Bot] ══════════════════════════════════════════════════');
    console.log('[Bot] Starting bot execution...');
    
    // 0. Check rate limit status FIRST - before any Twitter API calls
    const rateLimitStatus = await getRateLimitStatus();
    if (rateLimitStatus.isLimited) {
      console.log(`[Bot] ⚠️ Rate limited! Resets in ${rateLimitStatus.minutesRemaining} minutes`);
      console.log(`[Bot] Skipping this run to avoid burning rate limit`);
      result.success = true;
      result.skipped = 1;
      result.errors.push(`Rate limited. Resets at ${rateLimitStatus.resetTime?.toISOString()}`);
      result.duration_ms = Date.now() - startTime;
      return result;
    }
    
    // 1. Get configuration
    const config = await getBotConfig();
    result.dry_run = config.dry_run_mode;

    console.log('[Bot] Config:', {
      enabled: config.bot_enabled,
      dry_run: config.dry_run_mode,
      max_posts: config.max_posts_per_day,
    });

    // 2. Check if bot is enabled
    if (!config.bot_enabled) {
      console.log('[Bot] Bot is disabled. Exiting.');
      result.skipped = 1;
      result.success = true;
      result.duration_ms = Date.now() - startTime;
      return result;
    }

    // 3. Check daily quota
    const quota = await getDailyQuota(config.max_posts_per_day);
    result.quota_before = quota.used;

    console.log('[Bot] Daily quota:', {
      used: quota.used,
      remaining: quota.remaining,
      limit: quota.limit,
      percentage: `${quota.percentage.toFixed(1)}%`,
    });

    if (quota.remaining <= 0) {
      console.log('[Bot] Daily quota exhausted. Skipping.');
      result.skipped = 1;
      result.success = true;
      result.duration_ms = Date.now() - startTime;
      return result;
    }

    // 4. Validate Twitter credentials exist before trying to post
    try {
      validateTwitterCredentials();
    } catch (credError: any) {
      console.error('[Bot] ❌ Twitter credentials missing:', credError.message);
      result.errors.push(`Credentials: ${credError.message}`);
      result.failed = 1;
      result.duration_ms = Date.now() - startTime;
      return result;
    }

    // 5. Get Twitter client
    const twitterClient = getTwitterClient();

    // 6. Fetch unposted tips
    console.log('[Bot] Fetching unposted tips...');
    const unpostedTips = await getUnpostedTips(100);
    console.log(`[Bot] Found ${unpostedTips.length} unposted tips`);

    if (unpostedTips.length === 0) {
      console.log('[Bot] No unposted tips. Checking for scheduled posts...');
    }

    // 7. Enrich tips with priority and organize by type
    const enrichedTips = await enrichTipsWithPriority(unpostedTips, config);
    const tipsByType = organizeTipsByType(enrichedTips);

    console.log('[Bot] Tips by type:', {
      ultra_whale: tipsByType.ultra_whale.length,
      whale: tipsByType.whale.length,
      first_time: tipsByType.first_time.length,
      batch: tipsByType.batch.length,
    });

    // 8. Check for scheduled posts (separate success/attempt tracking for retry)
    const lastBatchSuccess = await getLastPostTime('batch');
    const lastBatchAttempt = await getLastAttemptTime('batch');
    const lastDailySuccess = await getLastPostTime('daily');
    const lastDailyAttempt = await getLastAttemptTime('daily');

    const includeBatchSummary = shouldPostBatchSummary(
      lastBatchSuccess ? new Date(lastBatchSuccess) : null,
      lastBatchAttempt ? new Date(lastBatchAttempt) : null
    );
    const today = new Date().toISOString().split('T')[0];
    const includeDailyRecap = shouldPostDailyRecap(
      today,
      lastDailySuccess ? new Date(lastDailySuccess).toISOString().split('T')[0] : null,
      lastDailyAttempt ? new Date(lastDailyAttempt) : null
    );

    console.log('[Bot] Scheduled posts:', {
      batch_summary: includeBatchSummary,
      daily_recap: includeDailyRecap,
    });

    // 8.5. Check for milestones
    console.log('[Bot] Checking for milestones...');
    const { checkMilestones } = await import('./aggregator');
    const milestone = await checkMilestones();
    if (milestone) {
      console.log(`[Bot] 🎉 Milestone detected: ${milestone.type} - ${milestone.milestone}`);
    }

    // 8. Create posting plan
    const plan = createPostingPlan(
      tipsByType,
      quota,
      includeBatchSummary,
      includeDailyRecap
    );
    
    // Add milestone to plan if detected
    plan.milestone = milestone;

    console.log('[Bot] Posting plan:', {
      batch_summary: plan.batch_summary,
      ultra_whale_batch: plan.ultra_whale_batch,
      whale_batch: plan.whale_batch,
      first_time_batch: plan.first_time_batch,
      daily_recap: plan.daily_recap,
      milestone: plan.milestone ? `${plan.milestone.type} - ${plan.milestone.milestone}` : null,
      total_planned: plan.total_planned + (plan.milestone ? 1 : 0),
    });

    // 9. Execute posting plan - ALL BATCH STRATEGY
    
    // Post batch summary (every 4 hours at 00:00, 04:00, 08:00, 12:00, 16:00, 20:00 UTC)
    if (plan.batch_summary) {
      try {
        console.log('[Bot] ⚡ Posting batch summary...');
        
        const { aggregateBatchSummary } = await import('./aggregator');
        const batchData = await aggregateBatchSummary(4);
        
        if (batchData) {
          const tweetText = formatBatchSummaryTweet(batchData);
          // Long-form tweet - no char limit validation
          
          const postResult = await twitterClient.postTweet(tweetText, config.dry_run_mode);
          
          if (postResult.success) {
            await recordPost({
              post_type: 'batch',
              tweet_id: postResult.tweet_id,
              tweet_text: tweetText,
              char_count: tweetText.length,
              status: 'posted',
            });
            result.posted++;
            result.processed.batch_summaries++;
            console.log('[Bot] ✅ Batch summary posted');
          } else {
            throw new Error(postResult.error || 'Unknown error');
          }
        } else {
          console.log('[Bot] ⚠️  Less than 2 tips in window, skipping batch summary');
        }
      } catch (error: any) {
        console.error('[Bot] ❌ Failed to post batch summary:', error.message);
        result.failed++;
        result.errors.push(`Batch summary: ${error.message}`);
        
        await recordPost({
          post_type: 'batch',
          tweet_text: 'Failed to post batch summary',
          char_count: 0,
          status: 'failed',
          error_message: error.message,
        });
      }
    }

    // Post ultra-whale batch ($100+ tips, every 4 hours)
    if (plan.ultra_whale_batch) {
      try {
        console.log('[Bot] 💰 Posting ultra-whale batch...');
        
        const { aggregateUltraWhaleBatch } = await import('./aggregator');
        const ultraWhaleData = await aggregateUltraWhaleBatch(4);
        
        if (ultraWhaleData) {
          const tweetText = formatUltraWhaleBatchTweet(ultraWhaleData);
          // Long-form tweet - no char limit validation
          
          const postResult = await twitterClient.postTweet(tweetText, config.dry_run_mode);
          
          if (postResult.success) {
            await recordPost({
              post_type: 'ultra_whale',
              tweet_id: postResult.tweet_id,
              tweet_text: tweetText,
              char_count: tweetText.length,
              status: 'posted',
            });
            result.posted++;
            result.processed.ultra_whale_tips++;
            console.log('[Bot] ✅ Ultra-whale batch posted');
          } else {
            throw new Error(postResult.error || 'Unknown error');
          }
        } else {
          console.log('[Bot] ⚠️  No ultra-whale tips in window');
        }
      } catch (error: any) {
        console.error('[Bot] ❌ Failed to post ultra-whale batch:', error.message);
        result.failed++;
        result.errors.push(`Ultra-whale batch: ${error.message}`);
        
        await recordPost({
          post_type: 'ultra_whale',
          tweet_text: 'Failed to post ultra-whale batch',
          char_count: 0,
          status: 'failed',
          error_message: error.message,
        });
      }
    }

    // Post whale batch ($50-99 tips, every 4 hours)
    if (plan.whale_batch) {
      try {
        console.log('[Bot] 🐳 Posting whale batch...');
        
        const { aggregateWhaleBatch } = await import('./aggregator');
        const whaleData = await aggregateWhaleBatch(4);
        
        if (whaleData) {
          const tweetText = formatWhaleBatchTweet(whaleData);
          // Long-form tweet - no char limit validation
          
          const postResult = await twitterClient.postTweet(tweetText, config.dry_run_mode);
          
          if (postResult.success) {
            await recordPost({
              post_type: 'whale',
              tweet_id: postResult.tweet_id,
              tweet_text: tweetText,
              char_count: tweetText.length,
              status: 'posted',
            });
            result.posted++;
            result.processed.whale_tips++;
            console.log('[Bot] ✅ Whale batch posted');
          } else {
            throw new Error(postResult.error || 'Unknown error');
          }
        } else {
          console.log('[Bot] ⚠️  No whale tips in window');
        }
      } catch (error: any) {
        console.error('[Bot] ❌ Failed to post whale batch:', error.message);
        result.failed++;
        result.errors.push(`Whale batch: ${error.message}`);
        
        await recordPost({
          post_type: 'whale',
          tweet_text: 'Failed to post whale batch',
          char_count: 0,
          status: 'failed',
          error_message: error.message,
        });
      }
    }

    // Post first-time batch (new recipients, every 4 hours)
    if (plan.first_time_batch) {
      try {
        console.log('[Bot] 🌟 Posting first-time batch...');
        
        const { aggregateFirstTimeBatch } = await import('./aggregator');
        const firstTimeData = await aggregateFirstTimeBatch(4);
        
        if (firstTimeData) {
          const tweetText = formatFirstTimeBatchTweet(firstTimeData);
          // Long-form tweet - no char limit validation
          
          const postResult = await twitterClient.postTweet(tweetText, config.dry_run_mode);
          
          if (postResult.success) {
            await recordPost({
              post_type: 'first_time',
              tweet_id: postResult.tweet_id,
              tweet_text: tweetText,
              char_count: tweetText.length,
              status: 'posted',
            });
            result.posted++;
            result.processed.first_time++;
            console.log('[Bot] ✅ First-time batch posted');
          } else {
            throw new Error(postResult.error || 'Unknown error');
          }
        } else {
          console.log('[Bot] ⚠️  No first-time recipients in window');
        }
      } catch (error: any) {
        console.error('[Bot] ❌ Failed to post first-time batch:', error.message);
        result.failed++;
        result.errors.push(`First-time batch: ${error.message}`);
        
        await recordPost({
          post_type: 'first_time',
          tweet_text: 'Failed to post first-time batch',
          char_count: 0,
          status: 'failed',
          error_message: error.message,
        });
      }
    }

    // Post daily recap (midnight UTC) - includes total volume
    if (plan.daily_recap) {
      try {
        console.log('[Bot] 📊 Posting daily recap...');
        
        const { aggregateDailyRecap } = await import('./aggregator');
        const dailyRecapData = await aggregateDailyRecap();
        
        if (dailyRecapData) {
          const tweetText = formatDailyRecapTweet(dailyRecapData);
          // formatDailyRecapTweet already calls ensureTweetLength internally
          
          const postResult = await twitterClient.postTweet(tweetText, config.dry_run_mode);
          
          if (postResult.success) {
            await recordPost({
              post_type: 'daily',
              tweet_id: postResult.tweet_id,
              tweet_text: tweetText,
              char_count: tweetText.length,
              status: 'posted',
            });
            result.posted++;
            result.processed.daily_recaps++;
            console.log('[Bot] ✅ Daily recap posted');
          } else {
            throw new Error(postResult.error || 'Unknown error');
          }
        } else {
          console.log('[Bot] ⚠️  No daily activity to recap');
        }
      } catch (error: any) {
        console.error('[Bot] ❌ Failed to post daily recap:', error.message);
        result.failed++;
        result.errors.push(`Daily recap: ${error.message}`);
        
        // Record failed recap to prevent immediate retry
        await recordPost({
          post_type: 'daily',
          tweet_text: 'Failed to post daily recap',
          char_count: 0,
          status: 'failed',
          error_message: error.message,
        });
      }
    }
    
    // Post milestone (if detected)
    if (plan.milestone) {
      const tweetText = formatMilestoneTweet(plan.milestone);
      try {
        console.log('[Bot] 🎉 Posting milestone...');
        // formatMilestoneTweet already calls ensureTweetLength internally
        
        const postResult = await twitterClient.postTweet(tweetText, config.dry_run_mode);
        
        if (postResult.success) {
          await recordPost({
            post_type: 'milestone',
            tweet_id: postResult.tweet_id,
            tweet_text: tweetText,
            char_count: tweetText.length,
            status: 'posted',
          });
          result.posted++;
          result.processed.milestones++;
          console.log('[Bot] ✅ Milestone posted');
        } else {
          throw new Error(postResult.error || 'Unknown error');
        }
      } catch (error: any) {
        console.error('[Bot] ❌ Failed to post milestone:', error.message);
        result.failed++;
        result.errors.push(`Milestone: ${error.message}`);
        
        // Record failed milestone to prevent retry loop
        await recordPost({
          post_type: 'milestone',
          tweet_text: tweetText,
          char_count: tweetText.length,
          status: 'failed',
          error_message: error.message,
        });
      }
    }

    // 10. Get final quota
    result.quota_after = await getTodayPostCount();
    result.success = true;
    result.duration_ms = Date.now() - startTime;

    console.log('[Bot] Execution complete:', {
      posted: result.posted,
      failed: result.failed,
      skipped: result.skipped,
      quota_remaining: config.max_posts_per_day - result.quota_after,
      duration_ms: result.duration_ms,
    });
    console.log('[Bot] ══════════════════════════════════════════════════');

    return result;
  } catch (error: any) {
    console.error('[Bot] Fatal error:', error);
    result.errors.push(`Fatal: ${error.message}`);
    result.duration_ms = Date.now() - startTime;
    return result;
  }
}
