// ============================================
// API: Points Processing Status (V2)
// GET /api/points/status
// ============================================

import { NextResponse } from 'next/server';
import { getProcessingStats } from '@/lib/points/processor';
import { createClient } from '@supabase/supabase-js';
import { POINTS_SUMMARY, BLOCKCHAIN_CONFIG, PROCESSING_CONFIG } from '@/lib/points/config';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export async function GET() {
  try {
    const stats = await getProcessingStats();
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { count: totalUsers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .gt('total_points', 0);

    const { count: totalFirstInteractions } = await supabase
      .from('first_interactions')
      .select('*', { count: 'exact', head: true });

    const { count: totalMilestones } = await supabase
      .from('volume_milestones')
      .select('*', { count: 'exact', head: true });

    return NextResponse.json({
      success: true,
      data: {
        version: 'v2',
        processing: {
          status: stats.status,
          lastProcessedBlock: stats.lastProcessedBlock,
          lastProcessedAt: stats.lastProcessedAt,
          totalEventsProcessed: stats.totalEventsProcessed,
          totalPointsAwarded: stats.totalPointsAwarded,
          cronSchedule: PROCESSING_CONFIG.cronSchedule,
        },
        database: {
          totalUsersWithPoints: totalUsers || 0,
          totalFirstInteractions: totalFirstInteractions || 0,
          totalMilestones: totalMilestones || 0,
        },
        config: {
          deploymentBlock: Number(BLOCKCHAIN_CONFIG.deploymentBlock),
          pointsSummary: POINTS_SUMMARY,
        },
      },
    });
  } catch (error) {
    console.error('Status API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
