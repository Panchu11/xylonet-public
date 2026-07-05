// ═══════════════════════════════════════════════════════════════════════════
// PayX Twitter Bot - Cron Job Endpoint
// Called by Vercel Cron every 10 minutes
// ═══════════════════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server';
import { runBot } from '@/lib/twitter-bot/orchestrator';

/**
 * POST /api/payx/bot/cron
 * Triggered by Vercel Cron to run bot
 */
export async function POST(request: NextRequest) {
  try {
    // Verify cron secret (localhost bypass for testing)
    const authHeader = request.headers.get('authorization');
    const host = request.headers.get('host') || '';
    const isLocalhost = host.includes('localhost') || host.includes('127.0.0.1');
    
    if (!isLocalhost && process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('[Cron API] Starting bot execution...');
    
    // Run the bot
    const result = await runBot();

    console.log('[Cron API] Bot execution complete:', {
      success: result.success,
      posted: result.posted,
      failed: result.failed,
      dry_run: result.dry_run,
    });

    return NextResponse.json({
      success: true,
      result,
    });
  } catch (error: any) {
    console.error('[Cron API] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Bot execution failed',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/payx/bot/cron
 * Called by Vercel Cron (Vercel cron uses GET by default)
 */
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret (localhost bypass for testing)
    const authHeader = request.headers.get('authorization');
    const host = request.headers.get('host') || '';
    const isLocalhost = host.includes('localhost') || host.includes('127.0.0.1');
    
    if (!isLocalhost && process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('[Cron API] Starting bot execution (GET)...');
    
    // Run the bot
    const result = await runBot();

    console.log('[Cron API] Bot execution complete:', {
      success: result.success,
      posted: result.posted,
      failed: result.failed,
      dry_run: result.dry_run,
    });

    return NextResponse.json({
      success: true,
      result,
    });
  } catch (error: any) {
    console.error('[Cron API] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Bot execution failed',
      },
      { status: 500 }
    );
  }
}
