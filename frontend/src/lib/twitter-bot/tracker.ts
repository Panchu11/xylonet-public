// ═══════════════════════════════════════════════════════════════════════════
// PayX Twitter Bot - Database Tracker
// Handles duplicate prevention, post tracking, and quota management
// ═══════════════════════════════════════════════════════════════════════════

import { createClient } from '@supabase/supabase-js';

// Create service role client for bot operations (bypasses RLS)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })
  : null;

// Fallback check
function getSupabase() {
  if (!supabase) {
    throw new Error('[Bot Tracker] Supabase service role not configured');
  }
  return supabase;
}
import type {
  BotPost,
  BotConfig,
  PostType,
  Priority,
  PostStatus,
  BotRuntimeConfig,
  UnpostedTip,
} from './types';

// ═══════════════════════════════════════════════════════════════════════════
// BOT CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Get bot runtime configuration from database
 * @returns Runtime configuration
 */
export async function getBotConfig(): Promise<BotRuntimeConfig> {
  try {
    const { data, error } = await getSupabase()
      .from('payx_bot_config')
      .select('*');

    if (error) throw error;

    // Convert array to key-value object
    const config: any = {};
    data?.forEach((item: BotConfig) => {
      config[item.key] = item.value;
    });

    return {
      bot_enabled: config.bot_enabled === 'true',
      dry_run_mode: config.dry_run_mode === 'true',
      max_posts_per_day: parseInt(config.max_posts_per_day) || 50,
      high_priority_min_amount: parseFloat(config.high_priority_min_amount) || 10,
      medium_priority_min_amount: parseFloat(config.medium_priority_min_amount) || 5,
      claim_url: config.claim_url || 'https://xylonet.xyz/payx/claim',
      timezone: config.timezone || 'UTC',
      cron_interval_minutes: parseInt(config.cron_interval_minutes) || 10,
    };
  } catch (error) {
    console.error('[Tracker] Error getting bot config:', error);
    throw error;
  }
}

/**
 * Update bot configuration
 * @param key Configuration key
 * @param value New value
 * @returns Success status
 */
export async function updateBotConfig(key: string, value: string): Promise<boolean> {
  try {
    const { error } = await getSupabase()
      .from('payx_bot_config')
      .update({ value, updated_at: new Date().toISOString() })
      .eq('key', key);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('[Tracker] Error updating bot config:', error);
    return false;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// DUPLICATE PREVENTION
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Check if a tip has already been posted
 * @param txHash Transaction hash
 * @returns True if already posted
 */
export async function isAlreadyPosted(txHash: string): Promise<boolean> {
  try {
    const { data } = await getSupabase().rpc('is_tip_already_posted', {
      tip_tx_hash: txHash
    });

    return data === true;
  } catch (error) {
    console.error('[Tracker] Error checking if posted:', error);
    return false; // Fail-safe: assume not posted
  }
}

/**
 * Get all unposted tips from database
 * Also includes tips that failed due to rate limit (so they can be retried)
 * @param limit Maximum number of tips to fetch
 * @returns Array of unposted tips
 */
export async function getUnpostedTips(limit: number = 100): Promise<UnpostedTip[]> {
  try {
    // Get tips that either:
    // 1. Have no entry in payx_bot_posts (never attempted)
    // 2. Have a failed entry with rate limit error (should retry)
    const { data, error } = await getSupabase()
      .from('payx_tips')
      .select(`
        id,
        tx_hash,
        from_address,
        to_handle,
        amount,
        message,
        timestamp
      `)
      .order('timestamp', { ascending: false })
      .limit(limit);

    if (error) throw error;
    if (!data) return [];

    // Get all tx_hashes that have been successfully posted or skipped
    const { data: postedTxHashes, error: postedError } = await getSupabase()
      .from('payx_bot_posts')
      .select('tx_hash')
      .in('status', ['posted', 'skipped'])
      .not('tx_hash', 'is', null);

    if (postedError) throw postedError;

    // Create a set of posted tx_hashes for fast lookup
    const postedSet = new Set((postedTxHashes || []).map((p: any) => p.tx_hash));

    // Filter out tips that have been successfully posted or skipped
    // Tips that failed can be retried
    const unposted = data.filter((tip: any) => !postedSet.has(tip.tx_hash));

    return unposted.map((tip: any) => ({
      tip_id: tip.id,
      tx_hash: tip.tx_hash,
      from_address: tip.from_address,
      to_handle: tip.to_handle,
      amount: parseFloat(tip.amount),
      message: tip.message,
      timestamp: tip.timestamp,
    }));
  } catch (error) {
    console.error('[Tracker] Error getting unposted tips:', error);
    return [];
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// POST TRACKING
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Record a posted tweet in the database
 * @param post Post data to record
 * @returns Success status
 */
export async function recordPost(post: {
  tip_id?: string;
  tx_hash?: string;
  tweet_id?: string;
  post_type: PostType;
  priority?: Priority;
  tweet_text: string;
  char_count: number;
  status: PostStatus;
  error_message?: string;
}): Promise<boolean> {
  try {
    const { error } = await getSupabase()
      .from('payx_bot_posts')
      .insert({
        tip_id: post.tip_id || null,
        tx_hash: post.tx_hash || null,
        tweet_id: post.tweet_id || null,
        post_type: post.post_type,
        priority: post.priority || null,
        tweet_text: post.tweet_text,
        char_count: post.char_count,
        status: post.status,
        error_message: post.error_message || null,
        posted_at: new Date().toISOString(),
      });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('[Tracker] Error recording post:', error);
    return false;
  }
}

/**
 * Get today's post count
 * @returns Number of posts today
 */
export async function getTodayPostCount(): Promise<number> {
  try {
    const { data } = await getSupabase().rpc('get_today_bot_post_count');
    return data || 0;
  } catch (error) {
    console.error('[Tracker] Error getting today post count:', error);
    return 0;
  }
}

/**
 * Get recent posts
 * @param limit Number of posts to fetch
 * @returns Array of recent posts
 */
export async function getRecentPosts(limit: number = 10): Promise<BotPost[]> {
  try {
    const { data, error } = await getSupabase()
      .from('payx_bot_posts')
      .select('*')
      .order('posted_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return (data || []) as BotPost[];
  } catch (error) {
    console.error('[Tracker] Error getting recent posts:', error);
    return [];
  }
}

/**
 * Get today's posts grouped by type and status
 * @returns Statistics object
 */
export async function getTodayStats(): Promise<{
  total: number;
  by_type: Record<PostType, number>;
  by_status: Record<PostStatus, number>;
}> {
  try {
    const { data, error } = await getSupabase()
      .from('payx_bot_posts')
      .select('post_type, status')
      .gte('posted_at', new Date().toISOString().split('T')[0]); // Today's date

    if (error) throw error;

    const stats: any = {
      total: data?.length || 0,
      by_type: {
        individual: 0,
        batch: 0,
        hourly: 0,
        daily: 0,
        weekly: 0,
        milestone: 0,
        first_time: 0,
        ultra_whale: 0,
        whale: 0,
      },
      by_status: {
        posted: 0,
        failed: 0,
        skipped: 0,
      },
    };

    data?.forEach((post: any) => {
      stats.by_type[post.post_type] = (stats.by_type[post.post_type] || 0) + 1;
      stats.by_status[post.status] = (stats.by_status[post.status] || 0) + 1;
    });

    return stats;
  } catch (error) {
    console.error('[Tracker] Error getting today stats:', error);
    return {
      total: 0,
      by_type: {
        individual: 0,
        batch: 0,
        hourly: 0,
        daily: 0,
        weekly: 0,
        milestone: 0,
        first_time: 0,
        ultra_whale: 0,
        whale: 0,
      },
      by_status: {
        posted: 0,
        failed: 0,
        skipped: 0,
      },
    };
  }
}

/**
 * Get last post of specific type
 * @param postType Post type to look for
 * @returns Last post or null
 */
export async function getLastPost(postType: PostType): Promise<BotPost | null> {
  try {
    const { data, error } = await getSupabase()
      .from('payx_bot_posts')
      .select('*')
      .eq('post_type', postType)
      .eq('status', 'posted')
      .order('posted_at', { ascending: false })
      .limit(1)
      .single();

    if (error || !data) return null;
    return data as BotPost;
  } catch {
    return null;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// RATE LIMIT TRACKING
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Check if we're currently rate limited by Twitter
 * Uses a 30-minute cooldown after any rate limit or daily cap error
 * Catches both 429 (Rate limit) and 403 daily tweet limit errors
 * @returns Rate limit status with reset time if limited
 */
export async function getRateLimitStatus(): Promise<{
  isLimited: boolean;
  resetTime: Date | null;
  minutesRemaining: number;
}> {
  try {
    // Get the most recent failed post with rate limit or daily cap error
    // Match: "Rate limit", "Daily tweet limit", "tweet limit", "limit reached"
    const { data, error } = await getSupabase()
      .from('payx_bot_posts')
      .select('error_message, posted_at')
      .eq('status', 'failed')
      .or('error_message.ilike.%Rate limit%,error_message.ilike.%tweet limit%,error_message.ilike.%limit reached%,error_message.ilike.%429%')
      .order('posted_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !data || !data.error_message) {
      return { isLimited: false, resetTime: null, minutesRemaining: 0 };
    }

    // Parse reset time from error message
    const resetMatch = data.error_message.match(/Resets at ([\d-T:.Z]+)/);
    const postTime = new Date(data.posted_at);
    const now = new Date();
    
    // Option 1: Use the parsed reset time if available and in future
    if (resetMatch) {
      const resetTime = new Date(resetMatch[1]);
      if (resetTime > now) {
        const minutesRemaining = Math.ceil((resetTime.getTime() - now.getTime()) / (1000 * 60));
        return { isLimited: true, resetTime, minutesRemaining };
      }
    }
    
    // Option 2: Use cooldown from last failure
    // For 403 daily limit: use longer cooldown (60 min) since daily cap lasts ~24h
    // For 429 rate limit: use 30 min cooldown
    const isDailyLimit = data.error_message.includes('Daily tweet limit') || data.error_message.includes('tweet limit');
    const COOLDOWN_MINUTES = isDailyLimit ? 60 : 30;
    const minutesSinceFailure = (now.getTime() - postTime.getTime()) / (1000 * 60);
    
    if (minutesSinceFailure < COOLDOWN_MINUTES) {
      const cooldownEnd = new Date(postTime.getTime() + COOLDOWN_MINUTES * 60 * 1000);
      const minutesRemaining = Math.ceil(COOLDOWN_MINUTES - minutesSinceFailure);
      console.log(`[Tracker] Rate/daily limit cooldown: ${minutesRemaining} min remaining (${COOLDOWN_MINUTES}min cooldown after last failure)`);
      return { isLimited: true, resetTime: cooldownEnd, minutesRemaining };
    }

    return { isLimited: false, resetTime: null, minutesRemaining: 0 };
  } catch (error) {
    console.error('[Tracker] Error checking rate limit status:', error);
    return { isLimited: false, resetTime: null, minutesRemaining: 0 };
  }
}
