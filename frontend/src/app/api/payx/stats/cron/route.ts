import { NextRequest, NextResponse } from 'next/server';
import { ethers } from 'ethers';
import { PayXTippingABI, PAYX_CONTRACT_ADDRESS, PAYX_DEPLOYMENT_BLOCK } from '@/config/abis/PayXTipping';
import { bulkIndexTips, getLastIndexedBlock } from '@/lib/payx-supabase';

// Arc Testnet RPC
const RPC_URL = process.env.NEXT_PUBLIC_ARC_RPC_URL || 'https://rpc.testnet.arc.network';

// Blockscout API for fast syncing (no block limit)
const BLOCKSCOUT_API = 'https://testnet.arcscan.app/api';

// TipSent event signature hash
const TIPSENT_TOPIC = '0x531a63334fe69fa9f4697e7cf8d0683d1bef9243a4c7a1046c8f95dede07680f';

/**
 * Fetch tips from Blockscout API (fast, no 10k block limit)
 */
async function fetchTipsFromBlockscout(fromBlock: number, toBlock: number): Promise<any[]> {
  const tips: any[] = [];
  let page = 1;
  const maxPages = 50;
  
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
    
    for (const log of data.result) {
      try {
        const tipper = '0x' + log.topics[2].slice(26);
        const abiCoder = new ethers.AbiCoder();
        const decoded = abiCoder.decode(
          ['string', 'uint256', 'uint256', 'string', 'uint256'],
          log.data
        );
        
        tips.push({
          tx_hash: log.transactionHash,
          from_address: tipper,
          to_handle: decoded[0],
          amount: Number(ethers.formatUnits(decoded[1], 6)),
          fee: Number(ethers.formatUnits(decoded[2], 6)),
          message: (decoded[3] || '').replace(/[\uD800-\uDFFF]/g, '').trim() || null,
          timestamp: new Date(Number(decoded[4]) * 1000).toISOString(),
          block_number: parseInt(log.blockNumber, 16),
        });
      } catch {
        // Skip malformed logs
      }
    }
    
    if (data.result.length < 1000) break;
    page++;
  }
  
  return tips;
}

/**
 * Fallback: fetch tips via RPC (10k block limit)
 */
async function fetchTipsFromRPC(fromBlock: number, toBlock: number): Promise<any[]> {
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const contract = new ethers.Contract(PAYX_CONTRACT_ADDRESS, PayXTippingABI, provider);
  
  const limitedToBlock = Math.min(fromBlock + 10000, toBlock);
  const tipSentFilter = contract.filters.TipSent();
  const events = await contract.queryFilter(tipSentFilter, fromBlock, limitedToBlock);
  
  const tips: any[] = [];
  for (const event of events) {
    if (!('args' in event)) continue;
    try {
      const args = (event as any).args;
      tips.push({
        tx_hash: event.transactionHash,
        from_address: args?.tipper as string,
        to_handle: args?.handle as string,
        amount: Number(ethers.formatUnits(args?.amount || 0, 6)),
        fee: Number(ethers.formatUnits(args?.fee || 0, 6)),
        message: (() => {
          try {
            const msg = args?.message;
            if (!msg || typeof msg !== 'string') return null;
            return msg.replace(/[\uD800-\uDFFF]/g, '').trim() || null;
          } catch { return null; }
        })(),
        timestamp: new Date(Number(args?.timestamp || 0) * 1000).toISOString(),
        block_number: event.blockNumber,
      });
    } catch {
      // Skip decode errors
    }
  }
  
  return tips;
}

/**
 * GET /api/payx/stats/cron
 * 
 * Vercel Cron endpoint - runs every 15 minutes to sync blockchain events to Supabase.
 * Directly imports sync logic instead of making HTTP self-call.
 * Uses Blockscout API (fast, no block limit) with RPC fallback.
 */
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret in production
    const authHeader = request.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      if (process.env.NODE_ENV === 'production') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    console.log('[PayX Stats Cron] Starting sync...');
    
    // Get current blockchain state
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const currentBlock = await provider.getBlockNumber();
    
    // Get last indexed block from Supabase
    const lastIndexedBlock = await getLastIndexedBlock();
    const fromBlock = lastIndexedBlock > 0 ? lastIndexedBlock + 1 : PAYX_DEPLOYMENT_BLOCK;
    
    if (fromBlock > currentBlock) {
      console.log('[PayX Stats Cron] Already up to date');
      return NextResponse.json({
        success: true,
        message: 'Already up to date',
        indexed: 0,
        isSynced: true,
        lastBlock: lastIndexedBlock,
        currentBlock,
        timestamp: new Date().toISOString(),
      });
    }
    
    const blocksToSync = currentBlock - fromBlock;
    console.log(`[PayX Stats Cron] Syncing ${blocksToSync} blocks (${fromBlock} to ${currentBlock})`);
    
    // Try Blockscout first (fast, no block limit), fallback to RPC
    let tips: any[] = [];
    let source = 'blockscout';
    
    try {
      tips = await fetchTipsFromBlockscout(fromBlock, currentBlock);
      console.log(`[PayX Stats Cron] Blockscout returned ${tips.length} tips`);
    } catch (blockscoutErr: any) {
      console.warn('[PayX Stats Cron] Blockscout failed, falling back to RPC:', blockscoutErr.message);
      source = 'rpc';
      try {
        tips = await fetchTipsFromRPC(fromBlock, currentBlock);
        console.log(`[PayX Stats Cron] RPC returned ${tips.length} tips`);
      } catch (rpcErr: any) {
        console.error('[PayX Stats Cron] RPC also failed:', rpcErr.message);
        return NextResponse.json({
          success: false,
          error: `Both Blockscout and RPC failed: ${rpcErr.message}`,
          timestamp: new Date().toISOString(),
        }, { status: 500 });
      }
    }
    
    // Index tips to Supabase (uses service role key via payx-supabase.ts)
    const indexed = tips.length > 0 ? await bulkIndexTips(tips) : 0;
    
    console.log('[PayX Stats Cron] Sync complete:', {
      indexed,
      source,
      fromBlock,
      currentBlock,
      blocksProcessed: blocksToSync,
    });

    return NextResponse.json({
      success: true,
      message: `Synced ${indexed} tips from ${source}`,
      indexed,
      source,
      fromBlock,
      toBlock: currentBlock,
      blocksProcessed: blocksToSync,
      isSynced: true,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('[PayX Stats Cron] Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Cron sync failed',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
