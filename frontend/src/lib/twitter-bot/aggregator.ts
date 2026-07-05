// ═══════════════════════════════════════════════════════════════════════════
// PayX Twitter Bot - Data Aggregator
// Aggregates PayX data for summary tweets (hourly, daily, weekly, milestones)
// ═══════════════════════════════════════════════════════════════════════════

import { createClient } from '@supabase/supabase-js';
import type {
  HourlySummaryData,
  DailyRecapData,
  WeeklyLeaderboardData,
  MilestoneData,
  BatchSummaryData,
  WhaleBatchData,
  UltraWhaleBatchData,
  FirstTimeBatchData,
} from './types';

// Service role client for bot operations (bypasses RLS)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
  : null;

function getSupabase() {
  if (!supabase) throw new Error('[Bot Aggregator] Supabase service role not configured');
  return supabase;
}

// ═══════════════════════════════════════════════════════════════════════════
// BATCH SUMMARY AGGREGATION (4-HOUR WINDOWS)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Aggregate ALL tips from the last N hours for batch summary tweet
 * Long-form: includes ALL recipients (Twitter Premium - no char limit)
 * Falls back to wider window if recent window is empty
 * @param windowHours Hours to look back (default 4)
 * @returns Batch summary data or null if truly no tips at all
 */
export async function aggregateBatchSummary(windowHours = 4): Promise<BatchSummaryData | null> {
  try {
    const now = new Date();
    let windowStart = new Date(now.getTime() - windowHours * 60 * 60 * 1000);

    // Get tips in primary window
    let { data: tips, error } = await getSupabase()
      .from('payx_tips')
      .select('amount, to_handle')
      .gte('timestamp', windowStart.toISOString())
      .order('amount', { ascending: false });

    if (error) throw error;

    // Fallback: if less than 1 tip in primary window, expand to 12 hours
    if (!tips || tips.length < 1) {
      const expandedWindowHours = 12;
      windowStart = new Date(now.getTime() - expandedWindowHours * 60 * 60 * 1000);
      const expanded = await getSupabase()
        .from('payx_tips')
        .select('amount, to_handle')
        .gte('timestamp', windowStart.toISOString())
        .order('amount', { ascending: false });
      
      if (expanded.error) throw expanded.error;
      tips = expanded.data;
      
      if (!tips || tips.length < 1) return null; // Truly no tips
    }

    // Aggregate by recipient (combine multiple tips to same handle)
    const recipientTotals: Record<string, number> = {};
    tips.forEach(tip => {
      const handle = tip.to_handle.toLowerCase();
      recipientTotals[handle] = (recipientTotals[handle] || 0) + parseFloat(tip.amount || '0');
    });

    // Sort by total amount - include ALL recipients
    const allRecipients = Object.entries(recipientTotals)
      .sort((a, b) => b[1] - a[1])
      .map(([handle, amount]) => ({ handle, amount }));

    return {
      window_start: windowStart.toISOString(),
      window_end: now.toISOString(),
      window_hours: windowHours,
      all_recipients: allRecipients,  // ALL recipients for long-form tweet
      total_tips: tips.length,
      claim_url: 'https://xylonet.xyz/payx/claim',
    };
  } catch (error) {
    console.error('[Aggregator] Error aggregating batch summary:', error);
    return null;
  }
}

/**
 * Aggregate whale tips ($50-99) from the last 4 hours
 * @param windowHours Hours to look back (default 4)
 * @returns Whale batch data or null if no whale tips
 */
export async function aggregateWhaleBatch(windowHours = 4): Promise<WhaleBatchData | null> {
  try {
    const now = new Date();
    const windowStart = new Date(now.getTime() - windowHours * 60 * 60 * 1000);

    // Get $50-99 tips in window
    const { data: tips, error } = await getSupabase()
      .from('payx_tips')
      .select('amount, to_handle, message')
      .gte('timestamp', windowStart.toISOString())
      .gte('amount', 50)
      .lt('amount', 100)
      .order('amount', { ascending: false });

    if (error) throw error;
    if (!tips || tips.length === 0) return null;

    return {
      window_hours: windowHours,
      tips: tips.map(tip => ({
        handle: tip.to_handle.toLowerCase(),
        amount: parseFloat(tip.amount || '0'),
        message: tip.message,
      })),
      total_tips: tips.length,
      claim_url: 'https://xylonet.xyz/payx/claim',
    };
  } catch (error) {
    console.error('[Aggregator] Error aggregating whale batch:', error);
    return null;
  }
}

/**
 * Aggregate ultra-whale tips ($100+) from the last 4 hours
 * @param windowHours Hours to look back (default 4)
 * @returns Ultra-whale batch data or null if no ultra-whale tips
 */
export async function aggregateUltraWhaleBatch(windowHours = 4): Promise<UltraWhaleBatchData | null> {
  try {
    const now = new Date();
    const windowStart = new Date(now.getTime() - windowHours * 60 * 60 * 1000);

    // Get $100+ tips in window
    const { data: tips, error } = await getSupabase()
      .from('payx_tips')
      .select('amount, to_handle, message')
      .gte('timestamp', windowStart.toISOString())
      .gte('amount', 100)
      .order('amount', { ascending: false });

    if (error) throw error;
    if (!tips || tips.length === 0) return null;

    return {
      window_hours: windowHours,
      tips: tips.map(tip => ({
        handle: tip.to_handle.toLowerCase(),
        amount: parseFloat(tip.amount || '0'),
        message: tip.message,
      })),
      total_tips: tips.length,
      claim_url: 'https://xylonet.xyz/payx/claim',
    };
  } catch (error) {
    console.error('[Aggregator] Error aggregating ultra-whale batch:', error);
    return null;
  }
}

/**
 * Aggregate first-time recipients from the last 4 hours
 * @param windowHours Hours to look back (default 4)
 * @returns First-time batch data or null if no first-time recipients
 */
export async function aggregateFirstTimeBatch(windowHours = 4): Promise<FirstTimeBatchData | null> {
  try {
    const now = new Date();
    const windowStart = new Date(now.getTime() - windowHours * 60 * 60 * 1000);

    // Get tips in window
    const { data: tips, error } = await getSupabase()
      .from('payx_tips')
      .select('amount, to_handle, timestamp')
      .gte('timestamp', windowStart.toISOString())
      .order('timestamp', { ascending: true });

    if (error) throw error;
    if (!tips || tips.length === 0) return null;

    // Find first-time recipients
    const firstTimeRecipients: Array<{ handle: string; amount: number }> = [];
    
    for (const tip of tips) {
      const handle = tip.to_handle.toLowerCase();
      
      // Check if this is their first tip ever
      const { data: previousTips, error: prevError } = await getSupabase()
        .from('payx_tips')
        .select('id')
        .eq('to_handle', handle)
        .lt('timestamp', tip.timestamp)
        .limit(1);
      
      if (!prevError && (!previousTips || previousTips.length === 0)) {
        // This is their first tip - check if already in list
        if (!firstTimeRecipients.find(r => r.handle === handle)) {
          firstTimeRecipients.push({
            handle,
            amount: parseFloat(tip.amount || '0'),
          });
        }
      }
    }

    if (firstTimeRecipients.length === 0) return null;

    return {
      window_hours: windowHours,
      recipients: firstTimeRecipients,
      total_recipients: firstTimeRecipients.length,
      claim_url: 'https://xylonet.xyz/payx/claim',
    };
  } catch (error) {
    console.error('[Aggregator] Error aggregating first-time batch:', error);
    return null;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// HOURLY SUMMARY AGGREGATION (DEPRECATED - Use Batch Summary)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Aggregate tips from the last hour
 * @returns Hourly summary data or null if no tips
 */
export async function aggregateHourlySummary(): Promise<HourlySummaryData | null> {
  try {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    // Get tips from last hour
    const { data: tips, error } = await getSupabase()
      .from('payx_tips')
      .select('amount, from_address, to_handle')
      .gte('timestamp', oneHourAgo.toISOString())
      .order('timestamp', { ascending: false });

    if (error) throw error;
    if (!tips || tips.length === 0) return null;

    // Calculate stats
    const totalTips = tips.length;
    const totalVolume = tips.reduce((sum, tip) => sum + parseFloat(tip.amount || '0'), 0);
    const uniqueTippers = new Set(tips.map(t => t.from_address.toLowerCase())).size;

    // Find most active tipper
    const tipperCounts: Record<string, { count: number; amount: number }> = {};
    tips.forEach(tip => {
      const addr = tip.from_address.toLowerCase();
      if (!tipperCounts[addr]) {
        tipperCounts[addr] = { count: 0, amount: 0 };
      }
      tipperCounts[addr].count++;
      tipperCounts[addr].amount += parseFloat(tip.amount || '0');
    });

    const mostActiveTipper = Object.entries(tipperCounts)
      .sort((a, b) => b[1].amount - a[1].amount)[0];

    return {
      hour: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
      tips_count: totalTips,
      total_amount: totalVolume,
      top_recipient: '',
      top_amount: mostActiveTipper?.[1].amount || 0,
      claim_url: 'https://xylonet.xyz/payx/claim',
    };
  } catch (error) {
    console.error('[Aggregator] Error aggregating hourly summary:', error);
    return null;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// DAILY RECAP AGGREGATION
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Aggregate tips from the last 24 hours
 * @returns Daily recap data or null if no tips
 */
export async function aggregateDailyRecap(): Promise<DailyRecapData | null> {
  try {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const today = new Date().toISOString().split('T')[0];

    // Get tips from last 24 hours
    const { data: tips, error } = await getSupabase()
      .from('payx_tips')
      .select('amount, from_address, to_handle')
      .gte('timestamp', oneDayAgo.toISOString())
      .order('timestamp', { ascending: false });

    if (error) throw error;
    if (!tips || tips.length === 0) return null;

    // Calculate stats
    const totalTips = tips.length;
    const totalVolume = tips.reduce((sum, tip) => sum + parseFloat(tip.amount || '0'), 0);
    const uniqueSenders = new Set(tips.map(t => t.from_address.toLowerCase())).size;
    const uniqueRecipients = new Set(tips.map(t => t.to_handle.toLowerCase())).size;

    // Calculate top recipients
    const recipientTotals: Record<string, number> = {};
    tips.forEach(tip => {
      const handle = tip.to_handle.toLowerCase();
      recipientTotals[handle] = (recipientTotals[handle] || 0) + parseFloat(tip.amount || '0');
    });

    const topRecipients = Object.entries(recipientTotals)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([handle, amount]) => ({ handle, amount }));

    return {
      date: today,
      total_tips: totalTips,
      total_volume: totalVolume,
      unique_senders: uniqueSenders,
      unique_recipients: uniqueRecipients,
      top_recipients: topRecipients,
      claim_url: 'https://xylonet.xyz/payx/claim',
    };
  } catch (error) {
    console.error('[Aggregator] Error aggregating daily recap:', error);
    return null;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// WEEKLY LEADERBOARD AGGREGATION
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Aggregate tips from the last 7 days
 * NOTE: No wallet addresses - only creator handles
 * @returns Weekly leaderboard data or null if no tips
 */
export async function aggregateWeeklyLeaderboard(): Promise<WeeklyLeaderboardData | null> {
  try {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const today = new Date();
    const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 6);

    const weekLabel = `${startOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;

    // Get tips from last 7 days
    const { data: tips, error } = await getSupabase()
      .from('payx_tips')
      .select('amount, to_handle')
      .gte('timestamp', sevenDaysAgo.toISOString())
      .order('timestamp', { ascending: false });

    if (error) throw error;
    if (!tips || tips.length === 0) return null;

    const totalVolume = tips.reduce((sum, tip) => sum + parseFloat(tip.amount || '0'), 0);

    // Calculate top recipients only (no wallet addresses)
    const recipientTotals: Record<string, number> = {};
    tips.forEach(tip => {
      const handle = tip.to_handle.toLowerCase();
      recipientTotals[handle] = (recipientTotals[handle] || 0) + parseFloat(tip.amount || '0');
    });

    const topRecipients = Object.entries(recipientTotals)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)  // Top 5 creators
      .map(([handle, amount]) => ({ handle, amount }));

    return {
      week: weekLabel,
      total_tips: tips.length,
      total_creators: Object.keys(recipientTotals).length,
      total_volume: totalVolume,
      top_recipients: topRecipients,
      claim_url: 'https://xylonet.xyz/payx/claim',
    };
  } catch (error) {
    console.error('[Aggregator] Error aggregating weekly leaderboard:', error);
    return null;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// MILESTONE DETECTION
// ═══════════════════════════════════════════════════════════════════════════

// Milestone thresholds
const VOLUME_MILESTONES = [1000, 5000, 10000, 25000, 50000, 100000, 250000, 500000, 1000000];
const TIP_COUNT_MILESTONES = [100, 500, 1000, 2500, 5000, 10000, 25000, 50000, 100000];

/**
 * Check if a volume milestone was recently crossed
 * @returns Milestone data or null if no milestone
 */
export async function checkVolumeMilestone(): Promise<MilestoneData | null> {
  try {
    // Get total volume
    const { data: tips, error } = await getSupabase()
      .from('payx_tips')
      .select('amount');

    if (error) throw error;
    if (!tips) return null;

    const totalVolume = tips.reduce((sum, tip) => sum + parseFloat(tip.amount || '0'), 0);

    // Check if we recently crossed a milestone (within last 50 tips)
    const recentTipsCount = 50;
    const { data: recentTips } = await getSupabase()
      .from('payx_tips')
      .select('amount')
      .order('timestamp', { ascending: false })
      .limit(recentTipsCount);

    if (!recentTips) return null;

    const recentVolume = recentTips.reduce((sum, tip) => sum + parseFloat(tip.amount || '0'), 0);
    const previousVolume = totalVolume - recentVolume;

    // Find if we crossed a milestone
    for (const milestone of VOLUME_MILESTONES) {
      if (previousVolume < milestone && totalVolume >= milestone) {
        // Check if we already posted about this milestone
        // Check raw number first
        const { data: existingPost1 } = await getSupabase()
          .from('payx_bot_posts')
          .select('id')
          .eq('post_type', 'milestone')
          .ilike('tweet_text', `%${milestone}%`)
          .limit(1);

        if (existingPost1 && existingPost1.length > 0) continue;
        
        // Check formatted number (with commas) separately
        const formattedMilestone = milestone.toLocaleString('en-US');
        const { data: existingPost2 } = await getSupabase()
          .from('payx_bot_posts')
          .select('id')
          .eq('post_type', 'milestone')
          .ilike('tweet_text', `%${formattedMilestone}%`)
          .limit(1);

        if (existingPost2 && existingPost2.length > 0) continue;

        return {
          type: 'volume',
          milestone: milestone,
          current: totalVolume,
          claim_url: 'https://xylonet.xyz/payx/claim',
        };
      }
    }

    return null;
  } catch (error) {
    console.error('[Aggregator] Error checking volume milestone:', error);
    return null;
  }
}

/**
 * Check if a tip count milestone was recently crossed
 * @returns Milestone data or null if no milestone
 */
export async function checkTipCountMilestone(): Promise<MilestoneData | null> {
  try {
    // Get total tip count
    const { count: totalTips, error } = await getSupabase()
      .from('payx_tips')
      .select('*', { count: 'exact', head: true });

    if (error) throw error;
    if (!totalTips) return null;

    // Check recent tips (last 20)
    const recentTipsCount = 20;
    const previousTipCount = totalTips - recentTipsCount;

    // Find if we crossed a milestone
    for (const milestone of TIP_COUNT_MILESTONES) {
      if (previousTipCount < milestone && totalTips >= milestone) {
        // Check if we already posted about this milestone
        // Check raw number first
        const { data: existingPost1 } = await getSupabase()
          .from('payx_bot_posts')
          .select('id')
          .eq('post_type', 'milestone')
          .ilike('tweet_text', `%${milestone}%`)
          .limit(1);

        if (existingPost1 && existingPost1.length > 0) continue;
        
        // Check formatted number (with commas) separately
        const formattedMilestone = milestone.toLocaleString('en-US');
        const { data: existingPost2 } = await getSupabase()
          .from('payx_bot_posts')
          .select('id')
          .eq('post_type', 'milestone')
          .ilike('tweet_text', `%${formattedMilestone}%`)
          .limit(1);

        if (existingPost2 && existingPost2.length > 0) continue;

        return {
          type: 'tips',
          milestone: milestone,
          current: totalTips,
          claim_url: 'https://xylonet.xyz/payx/claim',
        };
      }
    }

    return null;
  } catch (error) {
    console.error('[Aggregator] Error checking tip count milestone:', error);
    return null;
  }
}

/**
 * Check for any milestones
 * @returns Milestone data or null
 */
export async function checkMilestones(): Promise<MilestoneData | null> {
  // Check volume milestone first (more impressive)
  const volumeMilestone = await checkVolumeMilestone();
  if (volumeMilestone) return volumeMilestone;

  // Check tip count milestone
  const tipCountMilestone = await checkTipCountMilestone();
  if (tipCountMilestone) return tipCountMilestone;

  return null;
}
