// ============================================
// XYLONET POINTS SYSTEM V2 - MAIN PROCESSOR
// Daily batch processing via Vercel Cron
// Incremental event fetch + full points recalculation
// ============================================

import { createClient } from '@supabase/supabase-js';
import {
  getCurrentBlockNumber,
} from './blockscout';
import {
  incrementalUpdate,
  recalculateAllPoints,
} from './goldsky-import';
import {
  processAllPendingReferrals,
} from './referrals';
import {
  BLOCKCHAIN_CONFIG,
  PROCESSING_CONFIG,
} from './config';
import type {
  ProcessingState,
} from './types';

// ============================================
// SUPABASE CLIENT
// ============================================

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

function getSupabaseClient() {
  return createClient(supabaseUrl, supabaseServiceKey);
}

// ============================================
// PROCESSING STATE MANAGEMENT
// ============================================

export async function getProcessingState(): Promise<ProcessingState | null> {
  const supabase = getSupabaseClient();

  const { data } = await supabase
    .from('points_processing_state')
    .select('*')
    .eq('id', 'main')
    .single();

  return data as ProcessingState;
}

async function updateProcessingState(
  updates: Partial<ProcessingState>
): Promise<void> {
  const supabase = getSupabaseClient();

  await supabase
    .from('points_processing_state')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', 'main');
}

async function lockProcessing(): Promise<boolean> {
  const supabase = getSupabaseClient();

  const { data: current } = await supabase
    .from('points_processing_state')
    .select('status')
    .eq('id', 'main')
    .single();

  if (current?.status === 'running') {
    return false;
  }

  await updateProcessingState({ status: 'running' });
  return true;
}

async function unlockProcessing(
  success: boolean,
  errorMessage?: string
): Promise<void> {
  await updateProcessingState({
    status: success ? 'idle' : 'error',
    error_message: errorMessage || null,
    last_processed_at: new Date().toISOString(),
  });
}

// ============================================
// MAIN PROCESSOR (V2)
// ============================================

export interface ProcessingResult {
  success: boolean;
  eventsProcessed: number;
  pointsAwarded: number;
  usersUpdated: number;
  processingTimeMs: number;
  fromBlock: number;
  toBlock: number;
  error?: string;
}

/**
 * Main V2 processing function - run daily via cron
 * 1. Fetch new events since last_processed_block
 * 2. Aggregate and merge with existing wallet data
 * 3. Recalculate ALL user points (idempotent)
 * 4. Process pending referrals
 */
export async function processPoints(): Promise<ProcessingResult> {
  const startTime = Date.now();
  const result: ProcessingResult = {
    success: false,
    eventsProcessed: 0,
    pointsAwarded: 0,
    usersUpdated: 0,
    processingTimeMs: 0,
    fromBlock: 0,
    toBlock: 0,
  };

  try {
    // Acquire lock
    const locked = await lockProcessing();
    if (!locked) {
      result.error = 'Processing already in progress';
      return result;
    }

    // Get processing state
    const state = await getProcessingState();
    const fromBlock = state?.last_processed_block || Number(BLOCKCHAIN_CONFIG.deploymentBlock);

    // Get current block
    const currentBlock = await getCurrentBlockNumber();

    // Limit blocks per run
    const maxToBlock = fromBlock + Number(PROCESSING_CONFIG.blocksPerRun);
    const toBlock = currentBlock < maxToBlock ? currentBlock : maxToBlock;

    result.fromBlock = fromBlock;
    result.toBlock = toBlock;

    if (toBlock <= fromBlock) {
      result.success = true;
      result.error = 'No new blocks to process';
      await unlockProcessing(true);
      return result;
    }

    console.log(`V2 Processing: blocks ${fromBlock} -> ${toBlock}`);

    // Run incremental update (fetch new events + merge + recalculate all)
    const updateResult = await incrementalUpdate(fromBlock, toBlock);

    if (!updateResult.success) {
      throw new Error(updateResult.error || 'Incremental update failed');
    }

    result.eventsProcessed = updateResult.eventsProcessed || 0;
    result.usersUpdated = updateResult.usersUpdated || 0;
    result.pointsAwarded = updateResult.totalPoints || 0;

    // Process pending referrals
    console.log('Processing pending referrals...');
    const referralResult = await processAllPendingReferrals();
    result.pointsAwarded += referralResult.pointsAwarded;

    // Update processing state
    await updateProcessingState({
      last_processed_block: toBlock,
      events_processed: (state?.events_processed || 0) + result.eventsProcessed,
      points_awarded: result.pointsAwarded,
    });

    // Release lock
    await unlockProcessing(true);

    result.success = true;
    result.processingTimeMs = Date.now() - startTime;

    console.log(`V2 Processing complete: ${result.eventsProcessed} events, ${result.usersUpdated} users, ${result.pointsAwarded} points`);

  } catch (error) {
    console.error('V2 Processing error:', error);
    result.error = error instanceof Error ? error.message : 'Unknown error';
    await unlockProcessing(false, result.error);
  }

  result.processingTimeMs = Date.now() - startTime;
  return result;
}

/**
 * Get processing stats
 */
export async function getProcessingStats(): Promise<{
  lastProcessedBlock: number;
  lastProcessedAt: string | null;
  status: string;
  totalEventsProcessed: number;
  totalPointsAwarded: number;
}> {
  const state = await getProcessingState();

  return {
    lastProcessedBlock: state?.last_processed_block || 0,
    lastProcessedAt: state?.last_processed_at || null,
    status: state?.status || 'unknown',
    totalEventsProcessed: state?.events_processed || 0,
    totalPointsAwarded: state?.points_awarded || 0,
  };
}
