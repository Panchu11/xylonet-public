import { NextRequest, NextResponse } from 'next/server';
import { ethers } from 'ethers';

// Arc Testnet RPC
const getProvider = () => {
  const rpcUrl = process.env.NEXT_PUBLIC_ARC_RPC_URL || 'https://rpc.testnet.arc.network';
  return new ethers.JsonRpcProvider(rpcUrl);
};

// PayX Contract ABI (minimal for reading)
const PAYX_ABI = [
  'function getTipHistory(string calldata handle, uint256 offset, uint256 limit) external view returns (tuple(address tipper, uint256 amount, uint256 timestamp, string message)[])',
];

// Get contract instance
const getContract = () => {
  const contractAddress = process.env.NEXT_PUBLIC_PAYX_CONTRACT_ADDRESS;
  if (!contractAddress) {
    throw new Error('PAYX_CONTRACT_ADDRESS not configured');
  }
  return new ethers.Contract(contractAddress, PAYX_ABI, getProvider());
};

/**
 * GET /api/payx/tips/:handle/history
 * Get tip history for an X handle
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ handle: string }> }
) {
  try {
    const { handle } = await params;
    const { searchParams } = new URL(request.url);
    const offset = parseInt(searchParams.get('offset') || '0');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    
    const normalizedHandle = handle.toLowerCase();
    const contract = getContract();
    
    // Get tip history
    const tips = await contract.getTipHistory(normalizedHandle, offset, limit);
    
    const formattedTips = tips.map((tip: any) => ({
      tipper: tip.tipper,
      amount: ethers.formatUnits(tip.amount, 6),
      amountRaw: tip.amount.toString(),
      timestamp: Number(tip.timestamp),
      date: new Date(Number(tip.timestamp) * 1000).toISOString(),
      message: tip.message,
    }));
    
    return NextResponse.json({
      handle: normalizedHandle,
      offset,
      limit,
      tips: formattedTips,
    });
  } catch (error: any) {
    console.error('Get tip history error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tip history' },
      { status: 500 }
    );
  }
}
