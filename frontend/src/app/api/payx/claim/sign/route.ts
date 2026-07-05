import { NextRequest, NextResponse } from 'next/server';
import { ethers } from 'ethers';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { sessionOptions, SessionData } from '@/lib/session';

/**
 * POST /api/payx/claim/sign
 * Generate signature for claiming tips
 * Requires authenticated session with Twitter
 */
export async function POST(request: NextRequest) {
  try {
    // Verify user is authenticated
    const cookieStore = await cookies();
    const session = await getIronSession<SessionData>(cookieStore, sessionOptions);
    
    const handle = session.twitterHandle;
    if (!handle || !session.isLoggedIn) {
      return NextResponse.json(
        { error: 'Not authenticated with Twitter' },
        { status: 401 }
      );
    }
    
    const { walletAddress } = await request.json();
    
    // Validate wallet address
    if (!walletAddress || !ethers.isAddress(walletAddress)) {
      return NextResponse.json(
        { error: 'Invalid wallet address' },
        { status: 400 }
      );
    }
    
    // Normalize handle to lowercase
    const normalizedHandle = handle.toLowerCase();
    
    // Generate unique nonce
    const nonce = ethers.keccak256(
      ethers.toUtf8Bytes(`${normalizedHandle}-${walletAddress}-${Date.now()}-${Math.random()}`)
    );
    
    // Create message hash (must match contract's verification)
    const messageHash = ethers.solidityPackedKeccak256(
      ['string', 'address', 'bytes32'],
      [normalizedHandle, walletAddress, nonce]
    );
    
    // Sign with oracle private key
    const oraclePrivateKey = process.env.ORACLE_PRIVATE_KEY;
    if (!oraclePrivateKey) {
      return NextResponse.json(
        { error: 'Oracle not configured' },
        { status: 500 }
      );
    }
    
    const wallet = new ethers.Wallet(oraclePrivateKey);
    const signature = await wallet.signMessage(ethers.getBytes(messageHash));
    
    return NextResponse.json({
      success: true,
      data: {
        handle: normalizedHandle,
        walletAddress,
        nonce,
        signature,
        oracleAddress: wallet.address,
      },
    });
  } catch (error) {
    console.error('Claim sign error:', error);
    return NextResponse.json(
      { error: 'Failed to generate claim signature' },
      { status: 500 }
    );
  }
}
