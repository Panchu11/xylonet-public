// ============================================
// CRON: Process Points Daily (V2)
// Runs daily at midnight UTC via Vercel Cron
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { processPoints, getProcessingStats } from '@/lib/points/processor';
import { fullRebuildV2 } from '@/lib/points/goldsky-import';

// Cron secret for authentication
const CRON_SECRET = process.env.CRON_SECRET;

// Stale lock timeout (30 minutes)
const STALE_LOCK_TIMEOUT_MS = 30 * 60 * 1000;

// Supabase client for lock management
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

function getSupabase() {
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/**
 * Check and handle stale lock
 */
async function checkAndResetStaleLock(): Promise<{ wasStale: boolean; shouldProceed: boolean }> {
  const supabase = getSupabase();

  const { data: state } = await supabase
    .from('points_processing_state')
    .select('status, updated_at')
    .eq('id', 'main')
    .single();

  if (!state) {
    return { wasStale: false, shouldProceed: true };
  }

  if (state.status !== 'running') {
    return { wasStale: false, shouldProceed: true };
  }

  const updatedAt = new Date(state.updated_at).getTime();
  const now = Date.now();
  const lockAge = now - updatedAt;

  if (lockAge > STALE_LOCK_TIMEOUT_MS) {
    console.log(`[Points Cron] Stale lock detected (${Math.round(lockAge / 60000)} minutes old). Auto-resetting...`);

    await supabase
      .from('points_processing_state')
      .update({
        status: 'idle',
        error_message: `Auto-reset: Previous process was stuck for ${Math.round(lockAge / 60000)} minutes`,
        updated_at: new Date().toISOString(),
      })
      .eq('id', 'main');

    return { wasStale: true, shouldProceed: true };
  }

  console.log(`[Points Cron] Another process is running (started ${Math.round(lockAge / 60000)} minutes ago). Skipping.`);
  return { wasStale: false, shouldProceed: false };
}

/**
 * GET /api/cron/process-points
 * Triggered by Vercel Cron daily at midnight UTC
 */
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const lockCheck = await checkAndResetStaleLock();

    if (!lockCheck.shouldProceed) {
      return NextResponse.json({
        success: true,
        skipped: true,
        message: 'Another process is currently running',
      });
    }

    console.log('[Points Cron V2] Starting daily points processing...');

    const result = await processPoints();

    if (!result.success) {
      console.error('[Points Cron V2] Processing failed:', result.error);
      return NextResponse.json(
        {
          success: false,
          error: result.error,
          partialResult: {
            eventsProcessed: result.eventsProcessed,
            pointsAwarded: result.pointsAwarded,
            usersUpdated: result.usersUpdated,
          },
        },
        { status: 500 }
      );
    }

    console.log('[Points Cron V2] Processing completed successfully');

    return NextResponse.json({
      success: true,
      data: {
        events_processed: result.eventsProcessed,
        points_awarded: result.pointsAwarded,
        users_updated: result.usersUpdated,
        processing_time_ms: result.processingTimeMs,
        from_block: result.fromBlock,
        to_block: result.toBlock,
      },
    });
  } catch (error) {
    console.error('[Points Cron V2] Endpoint error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/cron/process-points
 * Manual trigger (admin only)
 * ?force=true to reset stale lock
 * ?full=true to run full rebuild from block 0
 */
export async function POST(request: NextRequest) {
  try {
    const adminKey = request.headers.get('x-admin-key');
    const authHeader = request.headers.get('authorization');
    const expectedAdminKey = process.env.ADMIN_API_KEY;
    const cronSecret = process.env.CRON_SECRET;
    const host = request.headers.get('host') || '';
    const isLocalhost = host.includes('localhost') || host.includes('127.0.0.1');

    const isAdminKeyValid = expectedAdminKey && adminKey === expectedAdminKey;
    const isCronSecretValid = cronSecret && authHeader === `Bearer ${cronSecret}`;

    if (!isAdminKeyValid && !isCronSecretValid && !isLocalhost) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const forceReset = searchParams.get('force') === 'true';
    const fullRebuild = searchParams.get('full') === 'true';

    if (forceReset) {
      console.log('[Points Cron V2] Force reset requested by admin');
      const supabase = getSupabase();
      await supabase
        .from('points_processing_state')
        .update({
          status: 'idle',
          error_message: 'Admin force reset',
          updated_at: new Date().toISOString(),
        })
        .eq('id', 'main');
    } else {
      const lockCheck = await checkAndResetStaleLock();

      if (!lockCheck.shouldProceed) {
        return NextResponse.json({
          success: false,
          error: 'Another process is currently running. Use ?force=true to override.',
        }, { status: 409 });
      }
    }

    // Full rebuild mode
    if (fullRebuild) {
      console.log('[Points Cron V2] Full rebuild triggered by admin');
      const rebuildResult = await fullRebuildV2();
      return NextResponse.json({
        success: rebuildResult.success,
        mode: 'full_rebuild',
        data: rebuildResult,
      });
    }

    // Normal incremental processing
    console.log('[Points Cron V2] Manual processing triggered...');
    const result = await processPoints();

    return NextResponse.json({
      success: result.success,
      data: {
        events_processed: result.eventsProcessed,
        points_awarded: result.pointsAwarded,
        users_updated: result.usersUpdated,
        processing_time_ms: result.processingTimeMs,
        from_block: result.fromBlock,
        to_block: result.toBlock,
      },
      error: result.error,
    });
  } catch (error) {
    console.error('[Points Cron V2] Manual processing error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export const maxDuration = 300;
export const dynamic = 'force-dynamic';
