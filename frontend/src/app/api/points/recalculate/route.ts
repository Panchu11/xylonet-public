// ============================================
// API: Recalculate Points (V2)
// POST /api/points/recalculate
// ?full=true for full rebuild from blockchain
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { recalculateAllPoints, fullRebuildV2 } from '@/lib/points/goldsky-import';

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

    if (!isLocalhost && !isAdminKeyValid && !isCronSecretValid) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const url = new URL(request.url);
    const fullRebuild = url.searchParams.get('full') === 'true';
    const startOffset = parseInt(url.searchParams.get('startOffset') || '0', 10);
    const maxUsersParam = url.searchParams.get('maxUsers');
    const maxUsers = maxUsersParam ? parseInt(maxUsersParam, 10) : undefined;

    if (fullRebuild) {
      console.log('Starting V2 full rebuild...');
      const result = await fullRebuildV2();
      return NextResponse.json({
        success: result.success,
        mode: 'full_rebuild',
        data: result,
      });
    }

    console.log(`Starting V2 points recalculation (offset: ${startOffset}, maxUsers: ${maxUsers || 'unlimited'})...`);

    const result = await recalculateAllPoints({
      startOffset,
      maxUsers,
    });

    return NextResponse.json({
      success: result.success,
      mode: 'recalculate',
      data: {
        usersProcessed: result.processed,
        totalPointsAwarded: result.totalPointsAwarded,
        nextOffset: result.nextOffset,
      },
    });
  } catch (error) {
    console.error('Recalculation API error:', error);
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
