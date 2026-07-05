// ═══════════════════════════════════════════════════════════════════════════
// PayX Twitter Bot - Status Endpoint
// Check bot health and configuration
// ═══════════════════════════════════════════════════════════════════════════

import { NextResponse } from 'next/server';
import {
  getBotConfig,
  getTodayPostCount,
  getRecentPosts,
  getTodayStats,
} from '@/lib/twitter-bot/tracker';
import { getDailyQuota } from '@/lib/twitter-bot/filter';
import type { BotStatusResponse } from '@/lib/twitter-bot/types';

/**
 * GET /api/payx/bot/status
 * Get bot status, configuration, and statistics
 */
export async function GET() {
  try {
    // Get configuration
    const config = await getBotConfig();

    // Get daily quota
    const quota = await getDailyQuota(config.max_posts_per_day);

    // Get recent posts
    const recentPosts = await getRecentPosts(1);
    const lastPost = recentPosts.length > 0 ? recentPosts[0] : null;

    // Get today's stats
    const todayStats = await getTodayStats();

    const response: BotStatusResponse = {
      enabled: config.bot_enabled,
      dry_run: config.dry_run_mode,
      daily_quota: quota,
      last_post: lastPost,
      today_stats: {
        total_posts: todayStats.total,
        by_type: todayStats.by_type,
        by_status: todayStats.by_status,
      },
      config: {
        max_posts_per_day: config.max_posts_per_day.toString(),
        high_priority_min: config.high_priority_min_amount.toString(),
        medium_priority_min: config.medium_priority_min_amount.toString(),
        claim_url: config.claim_url,
        timezone: config.timezone,
        cron_interval: config.cron_interval_minutes.toString(),
      },
    };

    return NextResponse.json({
      success: true,
      data: response,
    });
  } catch (error: any) {
    console.error('[Status API] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to get bot status',
      },
      { status: 500 }
    );
  }
}
