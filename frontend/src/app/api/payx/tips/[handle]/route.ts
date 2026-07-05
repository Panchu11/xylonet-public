import { NextRequest, NextResponse } from 'next/server';
import { ethers } from 'ethers';

// Arc Testnet RPC
const getProvider = () => {
  const rpcUrl = process.env.NEXT_PUBLIC_ARC_RPC_URL || 'https://rpc.testnet.arc.network';
  return new ethers.JsonRpcProvider(rpcUrl);
};

// PayX Contract ABI (minimal for reading)
const PAYX_ABI = [
  'function getPendingBalance(string calldata handle) external view returns (uint256)',
  'function getHandleInfo(string calldata handle) external view returns (tuple(uint256 pendingBalance, address linkedWallet, bool isRegistered, uint256 totalReceived, uint256 totalClaimed, uint256 tipCount))',
  'function getTipHistory(string calldata handle, uint256 offset, uint256 limit) external view returns (tuple(address tipper, uint256 amount, uint256 timestamp, string message)[])',
  'function getLinkedWallet(string calldata handle) external view returns (address)',
  'function isHandleRegistered(string calldata handle) external view returns (bool)',
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
 * GET /api/payx/tips/:handle
 * Get tip information for an X handle
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ handle: string }> }
) {
  try {
    const { handle } = await params;
    const normalizedHandle = handle.toLowerCase();
    
    const contract = getContract();
    
    // Get handle info
    const info = await contract.getHandleInfo(normalizedHandle);
    
    return NextResponse.json({
      handle: normalizedHandle,
      pendingBalance: ethers.formatUnits(info.pendingBalance, 6),
      pendingBalanceRaw: info.pendingBalance.toString(),
      linkedWallet: info.linkedWallet,
      isRegistered: info.isRegistered,
      totalReceived: ethers.formatUnits(info.totalReceived, 6),
      totalClaimed: ethers.formatUnits(info.totalClaimed, 6),
      tipCount: Number(info.tipCount),
    });
  } catch (error: any) {
    console.error('Get tips error:', error);
    
    // Handle contract not deployed
    if (error.message?.includes('not configured')) {
      return NextResponse.json(
        { error: 'Contract not configured' },
        { status: 503 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch tip data' },
      { status: 500 }
    );
  }
}
