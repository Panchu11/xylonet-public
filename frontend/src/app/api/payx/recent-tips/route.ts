import { NextRequest, NextResponse } from 'next/server';
import { ethers, EventLog } from 'ethers';
import { PayXTippingABI, PAYX_CONTRACT_ADDRESS } from '@/config/abis/PayXTipping';
import { getRecentTips } from '@/lib/payx-supabase';

// Arc Testnet RPC
const RPC_URL = process.env.NEXT_PUBLIC_ARC_RPC_URL || 'https://rpc.testnet.arc.network';

/**
 * GET /api/payx/recent-tips
 * Returns recent tips for the live activity feed
 * 
 * Query params:
 * - limit: number of tips to return (default: 10, max: 50)
 * - source: 'supabase' (default) or 'blockchain'
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 50);
    const source = searchParams.get('source') || 'supabase';

    // Try Supabase first (faster)
    if (source === 'supabase') {
      const tips = await getRecentTips(limit);
      
      if (tips.length > 0) {
        return NextResponse.json({
          success: true,
          data: tips.map(tip => ({
            id: tip.id,
            from: shortenAddress(tip.from_address),
            fromFull: tip.from_address,
            to: `@${tip.to_handle}`,
            toHandle: tip.to_handle,
            amount: formatUSD(tip.amount),
            amountRaw: tip.amount,
            message: tip.message,
            timestamp: tip.timestamp,
            timeAgo: getTimeAgo(new Date(tip.timestamp)),
            txHash: tip.tx_hash,
          })),
          source: 'supabase',
          count: tips.length,
        });
      }
    }

    // Fallback to blockchain
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const contract = new ethers.Contract(PAYX_CONTRACT_ADDRESS, PayXTippingABI, provider);

    // Get current block
    const currentBlock = await provider.getBlockNumber();
    const fromBlock = Math.max(0, currentBlock - 10000); // Last ~10k blocks

    // Fetch TipSent events
    const tipSentFilter = contract.filters.TipSent();
    const events = await contract.queryFilter(tipSentFilter, fromBlock, currentBlock);

    // Sort by block number (most recent first) and take limit
    const sortedEvents = events
      .filter((event): event is EventLog => 'args' in event)
      .sort((a, b) => b.blockNumber - a.blockNumber)
      .slice(0, limit);

    const tips = sortedEvents.map((event, index) => {
      const args = event.args;
      const amount = Number(ethers.formatUnits(args?.amount || 0, 6)); // Real USDC uses 6 decimals
      const timestamp = new Date(Number(args?.timestamp || 0) * 1000);

      return {
        id: `${event.transactionHash}-${index}`,
        from: shortenAddress(args?.tipper as string),
        fromFull: args?.tipper as string,
        to: `@${args?.handle}`,
        toHandle: args?.handle as string,
        amount: formatUSD(amount),
        amountRaw: amount,
        message: args?.message as string || null,
        timestamp: timestamp.toISOString(),
        timeAgo: getTimeAgo(timestamp),
        txHash: event.transactionHash,
      };
    });

    return NextResponse.json({
      success: true,
      data: tips,
      source: 'blockchain',
      count: tips.length,
      fromBlock,
      toBlock: currentBlock,
    });
  } catch (error: any) {
    console.error('[PayX Recent Tips API] Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to fetch recent tips',
        data: [],
      },
      { status: 500 }
    );
  }
}

// Helper: Shorten address for display
function shortenAddress(address: string): string {
  if (!address) return 'Unknown';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

// Helper: Format USD amount
function formatUSD(amount: number): string {
  if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(1)}K`;
  }
  return `$${amount.toFixed(2)}`;
}

// Helper: Get time ago string
function getTimeAgo(date: Date): string {
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}
