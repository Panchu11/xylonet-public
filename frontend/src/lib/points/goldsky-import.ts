// ============================================
// XYLONET POINTS SYSTEM V2 - DATA IMPORT & AGGREGATION
// Fetches all historical events from Blockscout REST API,
// aggregates per-wallet volumes/counts/active_dates,
// resolves PayX received via payx_users table,
// and recalculates all points using V2 formulas.
// ============================================

import { createClient } from '@supabase/supabase-js';
import {
  fetchAllEventsBlockscout,
  getCurrentBlockNumber,
  CONTRACTS,
} from './blockscout';
import {
  calculateTotalPoints,
  calculateConsistencyPoints,
  calculateAllMilestonePoints,
} from './calculator';
import {
  getDiversityMultiplier,
} from './config';
import type {
  SwapEvent,
  VaultEvent,
  PayXTipEvent,
  WalletAggregatedData,
  InteractionType,
  SybilRisk,
} from './types';

// Supabase config
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// USDC decimals
const USDC_DECIMALS = 6;

// Deployment block for XyloNet contracts
const DEPLOYMENT_BLOCK = 17100000;

// ============================================
// HELPER: Convert bigint amount to USD number
// ============================================

function toUsd(amount: bigint): number {
  return Number(amount) / Math.pow(10, USDC_DECIMALS);
}

// ============================================
// HELPER: Get UTC date string from timestamp
// ============================================

function timestampToDate(timestamp: number): string {
  const d = new Date(timestamp * 1000);
  return d.toISOString().slice(0, 10); // YYYY-MM-DD
}

// ============================================
// HELPER: Count products used
// ============================================

function countProducts(data: WalletAggregatedData): number {
  let count = 0;
  if (data.swapVolume > 0) count++;
  if (data.vaultVolume > 0) count++;
  if (data.payxSentVolume > 0) count++;
  if (data.payxReceivedVolume > 0) count++;
  return count;
}

// ============================================
// LOAD PayX handle -> wallet mapping
// from payx_users table (only claimed users)
// ============================================

async function loadPayxHandleToWalletMap(): Promise<Map<string, string>> {
  const map = new Map<string, string>();

  let offset = 0;
  const batchSize = 1000;

  while (true) {
    const { data, error } = await supabase
      .from('payx_users')
      .select('twitter_handle, wallet_address')
      .not('wallet_address', 'is', null)
      .range(offset, offset + batchSize - 1);

    if (error) {
      console.error('Error loading payx_users:', error);
      break;
    }

    if (!data || data.length === 0) break;

    for (const row of data) {
      if (row.twitter_handle && row.wallet_address) {
        // Normalize: handle stored as lowercase, wallet as lowercase
        const handle = row.twitter_handle.toLowerCase().replace('@', '');
        map.set(handle, row.wallet_address.toLowerCase());
      }
    }

    if (data.length < batchSize) break;
    offset += batchSize;
  }

  console.log(`Loaded ${map.size} PayX handle->wallet mappings`);
  return map;
}

// ============================================
// AGGREGATE EVENTS INTO PER-WALLET DATA
// ============================================

function aggregateEvents(
  swaps: SwapEvent[],
  vaultDeposits: VaultEvent[],
  payxTips: PayXTipEvent[],
  handleToWallet: Map<string, string>
): Map<string, WalletAggregatedData> {
  const walletMap = new Map<string, WalletAggregatedData>();

  function getOrCreate(wallet: string): WalletAggregatedData {
    const w = wallet.toLowerCase();
    if (!walletMap.has(w)) {
      walletMap.set(w, {
        wallet: w,
        swapVolume: 0,
        swapCount: 0,
        vaultVolume: 0,
        vaultCount: 0,
        payxSentVolume: 0,
        payxSentCount: 0,
        payxReceivedVolume: 0,
        payxClaimCount: 0,
        activeDates: new Set(),
      });
    }
    return walletMap.get(w)!;
  }

  // Process swaps
  for (const swap of swaps) {
    const wallet = swap.to.toLowerCase(); // 'to' is the recipient/trader
    const data = getOrCreate(wallet);
    const volume = toUsd(swap.amountIn);
    data.swapVolume += volume;
    data.swapCount++;
    if (swap.timestamp > 0) {
      data.activeDates.add(timestampToDate(swap.timestamp));
    }
  }

  // Process vault deposits only (not withdrawals)
  for (const vault of vaultDeposits) {
    if (vault.eventType !== 'deposit') continue;
    const wallet = vault.sender.toLowerCase();
    const data = getOrCreate(wallet);
    const volume = toUsd(vault.assets);
    data.vaultVolume += volume;
    data.vaultCount++;
    if (vault.timestamp > 0) {
      data.activeDates.add(timestampToDate(vault.timestamp));
    }
  }

  // Process PayX tips - tipper side (payx_sent)
  for (const tip of payxTips) {
    const tipper = tip.tipper.toLowerCase();
    const data = getOrCreate(tipper);
    const volume = toUsd(tip.amount);
    data.payxSentVolume += volume;
    data.payxSentCount++;
    if (tip.timestamp > 0) {
      data.activeDates.add(timestampToDate(tip.timestamp));
    }

    // Recipient side (payx_received) - resolve handle to wallet
    if (tip.handle) {
      const normalizedHandle = tip.handle.toLowerCase().replace('@', '');
      const recipientWallet = handleToWallet.get(normalizedHandle);
      if (recipientWallet) {
        const recipientData = getOrCreate(recipientWallet);
        recipientData.payxReceivedVolume += volume;
        recipientData.payxClaimCount++;
        if (tip.timestamp > 0) {
          recipientData.activeDates.add(timestampToDate(tip.timestamp));
        }
      }
    }
  }

  return walletMap;
}

// ============================================
// SOCIAL POINTS LOOKUP
// ============================================

async function getSocialPointsForUser(userId: string): Promise<number> {
  try {
    const { data: completions } = await supabase
      .from('task_completions')
      .select('task_id, tasks!inner(name, points, is_active, task_type)')
      .eq('user_id', userId);

    if (!completions) return 0;

    let points = 0;
    for (const completion of completions) {
      const task = completion.tasks as unknown as Record<string, unknown>;
      if (task && task.task_type === 'social') {
        points += (task.points as number) || 0;
      }
    }
    return points;
  } catch {
    return 0;
  }
}

// ============================================
// GET FIRST INTERACTIONS FOR USER
// ============================================

async function getFirstInteractions(userId: string): Promise<InteractionType[]> {
  const { data } = await supabase
    .from('first_interactions')
    .select('interaction_type')
    .eq('user_id', userId);

  return (data || []).map(r => r.interaction_type as InteractionType);
}

// ============================================
// RECALCULATE ALL POINTS (V2)
// Reads cumulative volumes from DB and recalculates
// ============================================

export async function recalculateAllPoints(options?: {
  startOffset?: number;
  maxUsers?: number;
}) {
  const startOffset = options?.startOffset ?? 0;
  const maxUsers = options?.maxUsers ?? Infinity;

  console.log('\n========================================');
  console.log('V2 POINTS RECALCULATION');
  console.log(`Offset: ${startOffset}, Max: ${maxUsers === Infinity ? 'unlimited' : maxUsers}`);
  console.log('========================================');

  let processed = 0;
  let totalPointsAwarded = 0;
  let offset = startOffset;
  const batchSize = 1000;
  const concurrentUpdates = 50;

  while (true) {
    const { data: users, error } = await supabase
      .from('users')
      .select(`
        id,
        wallet_address,
        cumulative_swap_volume,
        cumulative_vault_volume,
        cumulative_payx_sent,
        cumulative_payx_received,
        swap_count,
        vault_deposit_count,
        payx_sent_count,
        payx_claim_count,
        successful_referrals,
        referred_by_code,
        active_days,
        active_dates_json,
        products_used,
        sybil_risk,
        created_at
      `)
      .or('cumulative_swap_volume.gt.0,cumulative_vault_volume.gt.0,cumulative_payx_sent.gt.0,cumulative_payx_received.gt.0,successful_referrals.gt.0')
      .range(offset, offset + batchSize - 1);

    if (error) {
      console.error('Failed to fetch users:', error);
      return { success: false, error, processed: 0, totalPointsAwarded: 0, nextOffset: offset };
    }

    if (!users || users.length === 0) break;

    console.log(`Processing batch ${offset}-${offset + users.length}...`);

    for (let i = 0; i < users.length; i += concurrentUpdates) {
      const chunk = users.slice(i, i + concurrentUpdates);

      await Promise.all(chunk.map(async (user) => {
        const swapVol = user.cumulative_swap_volume || 0;
        const vaultVol = user.cumulative_vault_volume || 0;
        const payxSentVol = user.cumulative_payx_sent || 0;
        const payxReceivedVol = user.cumulative_payx_received || 0;
        const successfulReferrals = user.successful_referrals || 0;
        const sybilRisk = (user.sybil_risk || 'low') as SybilRisk;

        // Count products used
        let productsUsed = 0;
        if (swapVol > 0) productsUsed++;
        if (vaultVol > 0) productsUsed++;
        if (payxSentVol > 0) productsUsed++;
        if (payxReceivedVol > 0) productsUsed++;

        // Active days from stored dates
        let activeDays = 0;
        if (user.active_dates_json && Array.isArray(user.active_dates_json)) {
          activeDays = user.active_dates_json.length;
        } else {
          activeDays = user.active_days || 0;
        }

        // Get first interactions and social points
        const [firstInteractions, socialPoints] = await Promise.all([
          getFirstInteractions(user.id),
          getSocialPointsForUser(user.id),
        ]);

        // Check referral qualification
        const totalVolume = swapVol + vaultVol + payxSentVol + payxReceivedVol;
        const createdAt = new Date(user.created_at);
        const accountAgeHours = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60);
        const isReferralQualified = !!user.referred_by_code &&
          totalVolume >= 25 && productsUsed >= 2 && accountAgeHours >= 24;

        // Calculate V2 total points
        const result = calculateTotalPoints({
          cumulativeSwapVolume: swapVol,
          cumulativeVaultVolume: vaultVol,
          cumulativePayxSent: payxSentVol,
          cumulativePayxReceived: payxReceivedVol,
          productsUsed,
          completedFirstInteractions: firstInteractions,
          activeDays,
          successfulReferrals,
          wasReferred: !!user.referred_by_code,
          isReferralQualified,
          socialPoints,
          sybilRisk,
        });

        totalPointsAwarded += result.totalPoints;

        // Update user
        await supabase
          .from('users')
          .update({
            volume_points: result.adjustedVolumePoints,
            milestone_points: result.milestonePoints,
            first_interaction_points: result.firstInteractionPoints,
            consistency_points: result.consistencyPoints,
            referral_points: result.referralPoints,
            social_points: socialPoints,
            total_points: result.totalPoints,
            diversity_multiplier: result.diversityMultiplier,
            products_used: productsUsed,
            active_days: activeDays,
          })
          .eq('id', user.id);
      }));

      processed += chunk.length;
    }

    console.log(`  Processed ${processed} users so far...`);

    if (users.length < batchSize) break;
    if (processed >= maxUsers) {
      console.log(`  Reached max users limit (${maxUsers})`);
      break;
    }
    offset += batchSize;
  }

  // Also process social-only users
  console.log('\nProcessing social-only users...');
  const { data: socialOnlyUsers } = await supabase
    .from('users')
    .select('id, referred_by_code, sybil_risk')
    .eq('cumulative_swap_volume', 0)
    .eq('cumulative_vault_volume', 0)
    .eq('cumulative_payx_sent', 0);

  if (socialOnlyUsers && socialOnlyUsers.length > 0) {
    for (const user of socialOnlyUsers) {
      const socialPoints = await getSocialPointsForUser(user.id);
      if (socialPoints > 0) {
        const sybilRisk = (user.sybil_risk || 'low') as SybilRisk;
        const result = calculateTotalPoints({
          cumulativeSwapVolume: 0,
          cumulativeVaultVolume: 0,
          cumulativePayxSent: 0,
          cumulativePayxReceived: 0,
          productsUsed: 0,
          completedFirstInteractions: [],
          activeDays: 0,
          successfulReferrals: 0,
          wasReferred: !!user.referred_by_code,
          isReferralQualified: false,
          socialPoints,
          sybilRisk,
        });

        await supabase
          .from('users')
          .update({
            social_points: socialPoints,
            total_points: result.totalPoints,
          })
          .eq('id', user.id);

        processed++;
        totalPointsAwarded += result.totalPoints;
      }
    }
  }

  console.log(`\n========================================`);
  console.log(`V2 RECALCULATION COMPLETE!`);
  console.log(`Processed: ${processed} users`);
  console.log(`Total Points Awarded: ${totalPointsAwarded.toLocaleString()}`);
  console.log(`========================================`);

  return { success: true, processed, totalPointsAwarded, nextOffset: offset };
}

// ============================================
// FULL REBUILD V2
// Fetches ALL events from deployment block,
// resets user volumes, and recalculates everything
// ============================================

export async function fullRebuildV2(fromBlock?: number, toBlock?: number) {
  console.log('\n========================================');
  console.log('V2 FULL REBUILD - STARTING');
  console.log('========================================');

  try {
    const startBlock = fromBlock ?? DEPLOYMENT_BLOCK;
    const endBlock = toBlock ?? await getCurrentBlockNumber();

    console.log(`Block range: ${startBlock} to ${endBlock}`);
    console.log(`Total blocks to scan: ${endBlock - startBlock}\n`);

    // Step 1: Load PayX handle->wallet mapping
    console.log('Step 1: Loading PayX handle->wallet mappings...');
    const handleToWallet = await loadPayxHandleToWalletMap();

    // Step 2: Fetch ALL events from Blockscout
    console.log('\nStep 2: Fetching all events from Blockscout...');
    const events = await fetchAllEventsBlockscout(startBlock, endBlock);

    console.log(`\nTotal events fetched:`);
    console.log(`  Swaps: ${events.swaps.length}`);
    console.log(`  Vault: ${events.vaultDeposits.length}`);
    console.log(`  PayX: ${events.payxTips.length}`);

    // Step 3: Aggregate per-wallet data
    console.log('\nStep 3: Aggregating per-wallet data...');
    const walletData = aggregateEvents(
      events.swaps,
      events.vaultDeposits,
      events.payxTips,
      handleToWallet
    );
    console.log(`Unique wallets: ${walletData.size}`);

    // Step 4: Batch upsert all wallet data to Supabase
    console.log('\nStep 4: Upserting wallet data to Supabase...');
    const wallets = Array.from(walletData.values());
    const BATCH_SIZE = 50;
    let updated = 0;

    for (let i = 0; i < wallets.length; i += BATCH_SIZE) {
      const batch = wallets.slice(i, i + BATCH_SIZE);

      await Promise.all(batch.map(async (data) => {
        const activeDatesArray = Array.from(data.activeDates).sort();

        await supabase
          .from('users')
          .upsert({
            wallet_address: data.wallet,
            referral_code: `REF${data.wallet.slice(2, 10).toUpperCase()}`,
            cumulative_swap_volume: data.swapVolume,
            cumulative_vault_volume: data.vaultVolume,
            cumulative_payx_sent: data.payxSentVolume,
            cumulative_payx_received: data.payxReceivedVolume,
            swap_count: data.swapCount,
            vault_deposit_count: data.vaultCount,
            payx_sent_count: data.payxSentCount,
            payx_claim_count: data.payxClaimCount,
            products_used: countProducts(data),
            active_days: activeDatesArray.length,
            active_dates_json: activeDatesArray,
            diversity_multiplier: getDiversityMultiplier(countProducts(data)),
            last_activity_at: new Date().toISOString(),
            first_activity_at: activeDatesArray.length > 0
              ? new Date(activeDatesArray[0]).toISOString()
              : new Date().toISOString(),
          }, { onConflict: 'wallet_address' });
      }));

      updated += batch.length;
      if (updated % 500 === 0 || updated === wallets.length) {
        console.log(`  Upserted ${updated}/${wallets.length} wallets...`);
      }
    }

    // Step 5: Recalculate all points using V2 formulas
    console.log('\nStep 5: Recalculating all points with V2 formulas...');
    const recalcResult = await recalculateAllPoints();

    // Step 6: Update processing state
    console.log('\nStep 6: Updating processing state...');
    await supabase
      .from('points_processing_state')
      .upsert({
        id: 'main',
        status: 'idle',
        last_processed_block: endBlock,
        last_processed_at: new Date().toISOString(),
        events_processed: events.swaps.length + events.vaultDeposits.length + events.payxTips.length,
        points_awarded: recalcResult.totalPointsAwarded,
      });

    // Calculate summary stats
    const totalSwapVolume = wallets.reduce((sum, w) => sum + w.swapVolume, 0);
    const totalVaultVolume = wallets.reduce((sum, w) => sum + w.vaultVolume, 0);
    const totalPayxSentVolume = wallets.reduce((sum, w) => sum + w.payxSentVolume, 0);
    const totalPayxReceivedVolume = wallets.reduce((sum, w) => sum + w.payxReceivedVolume, 0);

    console.log('\n========================================');
    console.log('V2 FULL REBUILD COMPLETE!');
    console.log('========================================');
    console.log(`Wallets Updated: ${updated}`);
    console.log(`Total Swap Volume: $${totalSwapVolume.toLocaleString()}`);
    console.log(`Total Vault Volume: $${totalVaultVolume.toLocaleString()}`);
    console.log(`Total PayX Sent: $${totalPayxSentVolume.toLocaleString()}`);
    console.log(`Total PayX Received: $${totalPayxReceivedVolume.toLocaleString()}`);
    console.log(`Points Recalculated: ${recalcResult.processed} users`);
    console.log(`Total Points: ${recalcResult.totalPointsAwarded.toLocaleString()}`);
    console.log(`Block range: ${startBlock} -> ${endBlock}`);

    return {
      success: true,
      walletsUpdated: updated,
      swapVolume: totalSwapVolume,
      vaultVolume: totalVaultVolume,
      payxSentVolume: totalPayxSentVolume,
      payxReceivedVolume: totalPayxReceivedVolume,
      usersRecalculated: recalcResult.processed,
      totalPoints: recalcResult.totalPointsAwarded,
      toBlock: endBlock,
      swapCount: events.swaps.length,
      vaultCount: events.vaultDeposits.length,
      payxCount: events.payxTips.length,
    };
  } catch (error) {
    console.error('V2 Full rebuild failed:', error);
    return { success: false, error: String(error) };
  }
}

// ============================================
// INCREMENTAL UPDATE (for daily cron)
// Fetch new events since last block, aggregate,
// merge with existing data, recalculate all points
// ============================================

export async function incrementalUpdate(fromBlock: number, toBlock: number) {
  console.log('\n========================================');
  console.log('V2 INCREMENTAL UPDATE');
  console.log(`Blocks: ${fromBlock} -> ${toBlock}`);
  console.log('========================================');

  try {
    // Load PayX handle->wallet mapping
    const handleToWallet = await loadPayxHandleToWalletMap();

    // Fetch new events
    const events = await fetchAllEventsBlockscout(fromBlock, toBlock);
    const totalNewEvents = events.swaps.length + events.vaultDeposits.length + events.payxTips.length;

    if (totalNewEvents === 0) {
      console.log('No new events found');
      return { success: true, eventsProcessed: 0, usersUpdated: 0 };
    }

    // Aggregate new events
    const newData = aggregateEvents(
      events.swaps,
      events.vaultDeposits,
      events.payxTips,
      handleToWallet
    );

    console.log(`New events affect ${newData.size} wallets`);

    // Merge with existing user data (increment volumes)
    const wallets = Array.from(newData.values());
    const BATCH_SIZE = 50;
    let updated = 0;

    for (let i = 0; i < wallets.length; i += BATCH_SIZE) {
      const batch = wallets.slice(i, i + BATCH_SIZE);

      await Promise.all(batch.map(async (data) => {
        // Get existing user data
        const { data: existing } = await supabase
          .from('users')
          .select('cumulative_swap_volume, cumulative_vault_volume, cumulative_payx_sent, cumulative_payx_received, swap_count, vault_deposit_count, payx_sent_count, payx_claim_count, active_dates_json, products_used')
          .eq('wallet_address', data.wallet)
          .single();

        // Merge active dates
        const existingDates: string[] = (existing?.active_dates_json || []);
        const mergedDates = Array.from(new Set([...existingDates, ...data.activeDates])).sort();

        // Merge volumes (add new to existing)
        const newSwapVol = (existing?.cumulative_swap_volume || 0) + data.swapVolume;
        const newVaultVol = (existing?.cumulative_vault_volume || 0) + data.vaultVolume;
        const newPayxSent = (existing?.cumulative_payx_sent || 0) + data.payxSentVolume;
        const newPayxReceived = (existing?.cumulative_payx_received || 0) + data.payxReceivedVolume;
        const newSwapCount = (existing?.swap_count || 0) + data.swapCount;
        const newVaultCount = (existing?.vault_deposit_count || 0) + data.vaultCount;
        const newPayxSentCount = (existing?.payx_sent_count || 0) + data.payxSentCount;
        const newPayxClaimCount = (existing?.payx_claim_count || 0) + data.payxClaimCount;

        let productsUsed = 0;
        if (newSwapVol > 0) productsUsed++;
        if (newVaultVol > 0) productsUsed++;
        if (newPayxSent > 0) productsUsed++;
        if (newPayxReceived > 0) productsUsed++;

        await supabase
          .from('users')
          .upsert({
            wallet_address: data.wallet,
            referral_code: `REF${data.wallet.slice(2, 10).toUpperCase()}`,
            cumulative_swap_volume: newSwapVol,
            cumulative_vault_volume: newVaultVol,
            cumulative_payx_sent: newPayxSent,
            cumulative_payx_received: newPayxReceived,
            swap_count: newSwapCount,
            vault_deposit_count: newVaultCount,
            payx_sent_count: newPayxSentCount,
            payx_claim_count: newPayxClaimCount,
            products_used: productsUsed,
            active_days: mergedDates.length,
            active_dates_json: mergedDates,
            diversity_multiplier: getDiversityMultiplier(productsUsed),
            last_activity_at: new Date().toISOString(),
          }, { onConflict: 'wallet_address' });
      }));

      updated += batch.length;
    }

    console.log(`Updated ${updated} wallets with new event data`);

    // Recalculate ALL user points (idempotent V2 calculation)
    console.log('Recalculating all user points...');
    const recalcResult = await recalculateAllPoints();

    return {
      success: true,
      eventsProcessed: totalNewEvents,
      usersUpdated: updated,
      usersRecalculated: recalcResult.processed,
      totalPoints: recalcResult.totalPointsAwarded,
    };
  } catch (error) {
    console.error('Incremental update failed:', error);
    return { success: false, error: String(error) };
  }
}

// Keep old function names for backward compatibility
export const importBlockscoutData = fullRebuildV2;
export const importGoldskyData = fullRebuildV2;
export const recalculateAllVolumes = fullRebuildV2;
