import { NextRequest, NextResponse } from 'next/server';
import { ethers, EventLog } from 'ethers';
import { PayXTippingABI, PAYX_CONTRACT_ADDRESS, PAYX_DEPLOYMENT_BLOCK } from '@/config/abis/PayXTipping';
import { getPayXStats, bulkIndexTips, getLastIndexedBlock, getFirstIndexedBlock, syncUsersFromTips } from '@/lib/payx-supabase';

// Arc Testnet RPC
const RPC_URL = process.env.NEXT_PUBLIC_ARC_RPC_URL || 'https://rpc.testnet.arc.network';

// Blockscout API for fast syncing
const BLOCKSCOUT_API = 'https://testnet.arcscan.app/api';

// TipSent event signature hash
const TIPSENT_TOPIC = '0x531a63334fe69fa9f4697e7cf8d0683d1bef9243a4c7a1046c8f95dede07680f';

/**
 * Fetch PayX tips from Blockscout API (FAST - no block limits!)
 */
async function fetchTipsFromBlockscout(fromBlock: number, toBlock: number): Promise<any[]> {
  const tips: any[] = [];
  let page = 1;
  const maxPages = 100; // Safety limit
  
  console.log(`[PayX Blockscout] Fetching tips from block ${fromBlock} to ${toBlock}`);
  
  while (page <= maxPages) {
    const url = new URL(BLOCKSCOUT_API);
    url.searchParams.set('module', 'logs');
    url.searchParams.set('action', 'getLogs');
    url.searchParams.set('address', PAYX_CONTRACT_ADDRESS);
    url.searchParams.set('topic0', TIPSENT_TOPIC);
    url.searchParams.set('fromBlock', fromBlock.toString());
    url.searchParams.set('toBlock', toBlock.toString());
    url.searchParams.set('page', page.toString());
    url.searchParams.set('offset', '1000');
    
    const response = await fetch(url.toString());
    const data = await response.json();
    
    if (data.status !== '1' || !data.result || data.result.length === 0) {
      break;
    }
    
    // Parse the logs into tip objects
    for (const log of data.result) {
      try {
        // Decode the event data
        // Topics: [eventSig, handleHash (indexed), tipper (indexed)]
        // Data: handle (string), amount (uint256), fee (uint256), message (string), timestamp (uint256)
        const tipper = '0x' + log.topics[2].slice(26); // Extract address from topic
        
        // Decode the data field using ethers ABI decoder
        const abiCoder = new ethers.AbiCoder();
        const decoded = abiCoder.decode(
          ['string', 'uint256', 'uint256', 'string', 'uint256'],
          log.data
        );
        
        const handle = decoded[0];
        const amount = Number(ethers.formatUnits(decoded[1], 6));
        const fee = Number(ethers.formatUnits(decoded[2], 6));
        const message = decoded[3] || '';
        const timestamp = Number(decoded[4]);
        
        tips.push({
          tx_hash: log.transactionHash,
          from_address: tipper,
          to_handle: handle,
          amount,
          fee,
          message: message.replace(/[\uD800-\uDFFF]/g, '').trim() || null,
          timestamp: new Date(timestamp * 1000).toISOString(),
          block_number: parseInt(log.blockNumber, 16),
        });
      } catch (err) {
        console.warn('[PayX Blockscout] Failed to decode log:', log.transactionHash);
      }
    }
    
    console.log(`[PayX Blockscout] Page ${page}: ${data.result.length} logs, total tips: ${tips.length}`);
    
    if (data.result.length < 1000) {
      break; // Last page
    }
    page++;
  }
  
  console.log(`[PayX Blockscout] Total tips fetched: ${tips.length}`);
  return tips;
}

/**
 * GET /api/payx/stats
 * Returns real-time PayX statistics from blockchain events + Supabase
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const source = searchParams.get('source') || 'supabase'; // 'supabase' or 'blockchain'

    // If source is supabase, return cached stats
    if (source === 'supabase') {
      const stats = await getPayXStats();
      return NextResponse.json({
        success: true,
        data: stats,
        source: 'supabase',
      });
    }

    // Otherwise, fetch directly from blockchain
    console.log('[PayX Stats] Fetching from blockchain...');
    console.log('[PayX Stats] RPC URL:', RPC_URL);
    console.log('[PayX Stats] Contract:', PAYX_CONTRACT_ADDRESS);
    
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const contract = new ethers.Contract(PAYX_CONTRACT_ADDRESS, PayXTippingABI, provider);

    // Get current block
    const currentBlock = await provider.getBlockNumber();
    console.log('[PayX Stats] Current block:', currentBlock);
    
    // Arc RPC limits eth_getLogs to 10,000 blocks max
    const fromBlock = Math.max(0, currentBlock - 10000);
    console.log('[PayX Stats] Fetching from block:', fromBlock);

    // Fetch TipSent events
    const tipSentFilter = contract.filters.TipSent();
    const events = await contract.queryFilter(tipSentFilter, fromBlock, currentBlock);
    console.log('[PayX Stats] Found events:', events.length);

    // Calculate stats
    let totalVolume = BigInt(0);
    let volume24h = BigInt(0);
    let tips24h = 0;
    const uniqueTippers = new Set<string>();
    const uniqueRecipients = new Set<string>();

    const now = Math.floor(Date.now() / 1000);
    const yesterday = now - 24 * 60 * 60;

    for (const event of events) {
      // Type guard for EventLog
      if (!('args' in event)) {
        console.log('[PayX Stats] Event has no args, skipping');
        continue;
      }
      const eventLog = event as EventLog;
      const args = eventLog.args;
      if (!args) {
        console.log('[PayX Stats] Args is null, skipping');
        continue;
      }

      try {
        const amount = args.amount as bigint;
        const timestamp = Number(args.timestamp);
        const tipper = args.tipper as string;
        const handle = args.handle as string;

        console.log('[PayX Stats] Processing tip:', { amount: amount.toString(), tipper, handle, timestamp });

        totalVolume += amount;
        uniqueTippers.add(tipper.toLowerCase());
        uniqueRecipients.add(handle.toLowerCase());

        if (timestamp >= yesterday) {
          volume24h += amount;
          tips24h++;
        }
      } catch (eventErr) {
        console.error('[PayX Stats] Error processing event:', eventErr);
      }
    }

    const totalTips = events.length;
    const avgTip = totalTips > 0 ? totalVolume / BigInt(totalTips) : BigInt(0);

    // Format amounts - Real Circle USDC uses 6 decimals
    const formatAmount = (amount: bigint) => Number(ethers.formatUnits(amount, 6));

    const stats = {
      total_volume: formatAmount(totalVolume),
      total_tips: totalTips,
      total_users: uniqueTippers.size + uniqueRecipients.size,
      unique_tippers: uniqueTippers.size,
      unique_recipients: uniqueRecipients.size,
      volume_24h: formatAmount(volume24h),
      tips_24h: tips24h,
      avg_tip: formatAmount(avgTip),
      current_block: currentBlock,
      events_fetched: events.length,
      updated_at: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      data: stats,
      source: 'blockchain',
    });
  } catch (error: any) {
    console.error('[PayX Stats API] Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to fetch stats',
        // Return fallback zero stats
        data: {
          total_volume: 0,
          total_tips: 0,
          total_users: 0,
          unique_tippers: 0,
          unique_recipients: 0,
          volume_24h: 0,
          tips_24h: 0,
          avg_tip: 0,
          updated_at: new Date().toISOString(),
        }
      },
      { status: 500 }
    );
  }
}

/**
 * Safely extract message from event args
 * Handles invalid UTF-8 characters that can cause ABI decoding errors
 */
function safeGetMessage(args: any): string | null {
  try {
    const message = args?.message;
    if (!message || typeof message !== 'string') return null;
    // Remove invalid characters and return
    return message.replace(/[\uD800-\uDFFF]/g, '').trim() || null;
  } catch {
    // If message decoding fails, return null
    return null;
  }
}

/**
 * Process blockchain events into tip objects for Supabase
 */
function processEvents(events: any[]): any[] {
  const tips: any[] = [];
  
  for (const event of events) {
    if (!('args' in event)) continue;
    
    try {
      const eventLog = event as EventLog;
      const args = eventLog.args;
      
      tips.push({
        tx_hash: event.transactionHash,
        from_address: args?.tipper as string,
        to_handle: args?.handle as string,
        amount: Number(ethers.formatUnits(args?.amount || 0, 6)),
        fee: Number(ethers.formatUnits(args?.fee || 0, 6)),
        message: safeGetMessage(args),
        timestamp: new Date(Number(args?.timestamp || 0) * 1000).toISOString(),
        block_number: event.blockNumber,
      });
    } catch (err) {
      console.warn('[PayX Indexer] Skipping event due to decode error:', event.transactionHash);
    }
  }
  
  return tips;
}

/**
 * POST /api/payx/stats
 * Sync blockchain events to Supabase (indexer endpoint)
 * 
 * BATCH HISTORICAL SYNC:
 * - Fetches 10k blocks at a time (Arc RPC limit)
 * - Starts from PAYX_DEPLOYMENT_BLOCK if no data exists
 * - Subsequent calls continue from last indexed block
 * - Call multiple times to sync all historical data
 * 
 * Actions:
 * - ?action=sync-users : Sync user stats from tips
 * - ?action=full-sync : Force sync from deployment block (fills gaps)
 * - ?action=check-gaps : Check for gaps in historical data
 * - ?action=fast-sync : Use Blockscout API for FAST syncing (recommended!)
 */
export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    // Sync users from existing tips (repair function)
    if (action === 'sync-users') {
      const result = await syncUsersFromTips();
      return NextResponse.json({
        success: true,
        message: `Synced ${result.tippers} tippers and ${result.recipients} recipients`,
        ...result,
      });
    }

    // FAST SYNC using Blockscout API (no 10k block limit!)
    // Supports ?maxBlocks=500000 to limit sync range per call
    if (action === 'fast-sync') {
      console.log('[PayX Fast Sync] Starting Blockscout-based sync...');
      
      const lastIndexedBlock = await getLastIndexedBlock();
      const provider = new ethers.JsonRpcProvider(RPC_URL);
      const currentBlock = await provider.getBlockNumber();
      
      // Allow limiting the sync range to prevent timeouts
      const maxBlocksParam = searchParams.get('maxBlocks');
      const maxBlocks = maxBlocksParam ? parseInt(maxBlocksParam, 10) : 500000; // Default 500k blocks max
      
      const fromBlock = lastIndexedBlock > 0 ? lastIndexedBlock + 1 : PAYX_DEPLOYMENT_BLOCK;
      
      if (fromBlock > currentBlock) {
        return NextResponse.json({
          success: true,
          message: 'Already up to date',
          indexed: 0,
          isSynced: true,
          lastBlock: lastIndexedBlock,
          currentBlock,
        });
      }
      
      // Limit toBlock to prevent timeout
      const toBlock = Math.min(fromBlock + maxBlocks, currentBlock);
      const blocksToSync = toBlock - fromBlock;
      const remainingBlocks = currentBlock - toBlock;
      
      console.log(`[PayX Fast Sync] Syncing ${blocksToSync} blocks (${fromBlock} to ${toBlock})`);
      if (remainingBlocks > 0) {
        console.log(`[PayX Fast Sync] ${remainingBlocks} blocks will remain after this batch`);
      }
      
      // Fetch tips using Blockscout (FAST!)
      const tips = await fetchTipsFromBlockscout(fromBlock, toBlock);
      
      // Bulk index to Supabase
      const indexed = tips.length > 0 ? await bulkIndexTips(tips) : 0;
      
      // Skip user sync during fast-sync for performance - use ?action=sync-users separately
      // if (indexed > 0) {
      //   await syncUsersFromTips();
      // }
      
      return NextResponse.json({
        success: true,
        message: remainingBlocks > 0 
          ? `Synced ${indexed} tips. ${remainingBlocks.toLocaleString()} blocks remaining - run again to continue.`
          : `Fast sync complete! Indexed ${indexed} tips.`,
        indexed,
        fromBlock,
        toBlock,
        blocksProcessed: blocksToSync,
        blocksRemaining: remainingBlocks,
        isSynced: remainingBlocks === 0,
        source: 'blockscout',
      });
    }

    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const contract = new ethers.Contract(PAYX_CONTRACT_ADDRESS, PayXTippingABI, provider);
    const currentBlock = await provider.getBlockNumber();

    // Check for gaps in historical data
    if (action === 'check-gaps') {
      const lastIndexedBlock = await getLastIndexedBlock();
      const firstIndexedBlock = await getFirstIndexedBlock();
      
      const hasGap = firstIndexedBlock > PAYX_DEPLOYMENT_BLOCK;
      const gapSize = hasGap ? firstIndexedBlock - PAYX_DEPLOYMENT_BLOCK : 0;
      
      return NextResponse.json({
        success: true,
        deploymentBlock: PAYX_DEPLOYMENT_BLOCK,
        firstIndexedBlock,
        lastIndexedBlock,
        currentBlock,
        hasGap,
        gapSize,
        message: hasGap 
          ? `Gap detected: ${gapSize.toLocaleString()} blocks missing (${PAYX_DEPLOYMENT_BLOCK} to ${firstIndexedBlock}). Use ?action=full-sync to fill.`
          : 'No gaps detected. Historical data is complete.',
      });
    }

    // Get last indexed block from Supabase
    const lastIndexedBlock = await getLastIndexedBlock();
    
    // Determine starting block
    let fromBlock: number;
    
    if (action === 'full-sync') {
      // Force sync from deployment block to fill any gaps
      // Find the first indexed block to know where the gap ends
      const firstIndexedBlock = await getFirstIndexedBlock();
      
      if (firstIndexedBlock > PAYX_DEPLOYMENT_BLOCK) {
        // There's a gap - sync from deployment to first indexed block
        fromBlock = PAYX_DEPLOYMENT_BLOCK;
        const toBlock = Math.min(fromBlock + 10000, firstIndexedBlock - 1);
        
        console.log(`[PayX Indexer] FULL-SYNC: Filling gap from ${fromBlock} to ${toBlock}`);
        
        // Fetch and index this gap batch
        const tipSentFilter = contract.filters.TipSent();
        const events = await contract.queryFilter(tipSentFilter, fromBlock, toBlock);
        
        const tips = await processEvents(events);
        const indexed = tips.length > 0 ? await bulkIndexTips(tips) : 0;
        
        const gapRemaining = firstIndexedBlock - toBlock - 1;
        
        return NextResponse.json({
          success: true,
          message: gapRemaining > 0 
            ? `Gap sync: ${indexed} tips indexed. ${gapRemaining.toLocaleString()} gap blocks remaining.`
            : `Gap filled! ${indexed} tips indexed. Now run normal sync to continue.`,
          indexed,
          fromBlock,
          toBlock,
          gapRemaining,
          isFillingGap: true,
        });
      } else {
        // No gap - just continue from last indexed
        fromBlock = lastIndexedBlock > 0 ? lastIndexedBlock + 1 : PAYX_DEPLOYMENT_BLOCK;
      }
    } else {
      // Normal sync - continue from last indexed block
      if (lastIndexedBlock > 0) {
        fromBlock = lastIndexedBlock + 1;
      } else {
        fromBlock = PAYX_DEPLOYMENT_BLOCK;
      }
    }

    // Already fully synced
    if (fromBlock > currentBlock) {
      return NextResponse.json({
        success: true,
        message: 'Already up to date',
        indexed: 0,
        lastBlock: lastIndexedBlock,
        currentBlock,
        isSynced: true,
      });
    }

    // Calculate how many blocks we need to sync
    const blocksRemaining = currentBlock - fromBlock;
    const isCatchingUp = blocksRemaining > 10000;
    
    // Limit to 10k blocks per call (RPC limit)
    // Don't skip - just process 10k and let next call continue
    const toBlock = Math.min(fromBlock + 10000, currentBlock);
    
    console.log(`[PayX Indexer] Syncing blocks ${fromBlock} to ${toBlock} (${blocksRemaining} remaining)`);

    // Fetch TipSent events for this batch
    const tipSentFilter = contract.filters.TipSent();
    const events = await contract.queryFilter(tipSentFilter, fromBlock, toBlock);

    // Transform events for Supabase - with safe message extraction
    const tips: any[] = [];
    let skipped = 0;
    
    for (const event of events) {
      if (!('args' in event)) continue;
      
      try {
        const eventLog = event as EventLog;
        const args = eventLog.args;
        
        tips.push({
          tx_hash: event.transactionHash,
          from_address: args?.tipper as string,
          to_handle: args?.handle as string,
          amount: Number(ethers.formatUnits(args?.amount || 0, 6)),
          fee: Number(ethers.formatUnits(args?.fee || 0, 6)),
          message: safeGetMessage(args),
          timestamp: new Date(Number(args?.timestamp || 0) * 1000).toISOString(),
          block_number: event.blockNumber,
        });
      } catch (err) {
        console.warn('[PayX Indexer] Skipping event due to decode error:', event.transactionHash);
        skipped++;
      }
    }

    // Bulk index to Supabase
    const indexed = tips.length > 0 ? await bulkIndexTips(tips) : 0;
    
    // Calculate sync progress
    const totalBlocksToSync = currentBlock - PAYX_DEPLOYMENT_BLOCK;
    const blocksSynced = toBlock - PAYX_DEPLOYMENT_BLOCK;
    const progressPercent = Math.min(100, Math.round((blocksSynced / totalBlocksToSync) * 100));

    return NextResponse.json({
      success: true,
      message: isCatchingUp 
        ? `Batch sync: ${indexed} tips indexed. ${blocksRemaining - 10000} blocks remaining. Call again to continue.`
        : `Indexed ${indexed} tips${skipped > 0 ? ` (${skipped} skipped)` : ''}. Fully synced!`,
      indexed,
      skipped,
      fromBlock,
      toBlock,
      currentBlock,
      eventsFound: events.length,
      isCatchingUp,
      blocksRemaining: Math.max(0, currentBlock - toBlock),
      progressPercent,
      isSynced: toBlock >= currentBlock,
    });
  } catch (error: any) {
    console.error('[PayX Indexer API] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Indexing failed' },
      { status: 500 }
    );
  }
}
