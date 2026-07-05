// ============================================
// API: Import Blockchain Data via Blockscout
// Bulk import of historical blockchain data
// Migrated from Goldsky (Feb 2025)
// 
// Actions:
// - POST: Regular incremental import
// - POST ?action=recalculate-volumes: Recalculate ALL volumes from scratch
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { importBlockscoutData, recalculateAllVolumes } from '@/lib/points/goldsky-import';

export async function POST(request: NextRequest) {
  try {
    // Check for admin key (localhost bypass for development)
    const adminKey = request.headers.get('x-admin-key');
    const expectedAdminKey = process.env.ADMIN_API_KEY;
    const host = request.headers.get('host') || '';
    const isLocalhost = host.includes('localhost') || host.includes('127.0.0.1');
    
    if (!isLocalhost && expectedAdminKey && adminKey !== expectedAdminKey) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse query params
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const fromBlock = searchParams.get('fromBlock') ? parseInt(searchParams.get('fromBlock')!) : undefined;
    const toBlock = searchParams.get('toBlock') ? parseInt(searchParams.get('toBlock')!) : undefined;

    // Handle volume recalculation action
    if (action === 'recalculate-volumes') {
      console.log('Starting volume recalculation from scratch...');
      const result = await recalculateAllVolumes(fromBlock, toBlock);
      
      return NextResponse.json({
        success: result.success,
        action: 'recalculate-volumes',
        data: result,
      });
    }

    // Default: regular import
    console.log('Starting Blockscout data import...');
    if (fromBlock || toBlock) {
      console.log(`Block range: ${fromBlock || 'deployment'} to ${toBlock || 'current'}`);
    }
    
    const result = await importBlockscoutData(fromBlock, toBlock);
    
    return NextResponse.json({
      success: result.success,
      data: {
        walletsUpdated: result.walletsUpdated,
        swapVolume: result.swapVolume,
        vaultVolume: result.vaultVolume,
        payxSentVolume: result.payxSentVolume,
        payxReceivedVolume: result.payxReceivedVolume,
        usersRecalculated: result.usersRecalculated,
        totalPoints: result.totalPoints,
        toBlock: result.toBlock,
      },
      source: 'blockscout',
      error: result.error,
    });
  } catch (error) {
    console.error('Import API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export const maxDuration = 300; // 5 minute timeout for large imports
export const dynamic = 'force-dynamic';
