import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { ethers } from "ethers";

// ═══════════════════════════════════════════════════════════════════════════════
// FAUCET DISABLED - ABUSE DETECTED
// Set to true to re-enable the faucet
// Last updated: 2026-01-14 - Private repo deployment test
// ═══════════════════════════════════════════════════════════════════════════════
const FAUCET_ENABLED = false;

// Constants
const ARC_RPC = "https://rpc.testnet.arc.network";
const USDC_ADDRESS = "0x3600000000000000000000000000000000000000";
const FAUCET_AMOUNT = "2000000"; // 2 USDC (6 decimals)
const FAUCET_AMOUNT_DISPLAY = "2";

// ERC20 ABI (only transfer function needed)
const ERC20_ABI = [
  "function transfer(address to, uint256 amount) external returns (bool)",
  "function balanceOf(address account) external view returns (uint256)",
];

// Initialize Supabase server client
function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!url || !key) {
    throw new Error("Supabase credentials not configured");
  }
  
  return createClient(url, key);
}

// Validate Ethereum address
function isValidAddress(address: string): boolean {
  try {
    return ethers.isAddress(address);
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  // ═══════════════════════════════════════════════════════════════════════════════
  // EMERGENCY DISABLE - Faucet temporarily shut down due to abuse
  // ═══════════════════════════════════════════════════════════════════════════════
  if (!FAUCET_ENABLED) {
    return NextResponse.json(
      { 
        success: false, 
        error: "Faucet temporarily disabled for maintenance. Please use Circle Faucet at https://faucet.circle.com",
        disabled: true
      },
      { status: 503 }
    );
  }

  try {
    // Parse request body
    const body = await request.json();
    const { walletAddress } = body;

    // Validate wallet address
    if (!walletAddress || !isValidAddress(walletAddress)) {
      return NextResponse.json(
        { success: false, error: "Invalid wallet address" },
        { status: 400 }
      );
    }

    const normalizedAddress = walletAddress.toLowerCase();

    // Check faucet private key
    const privateKey = process.env.FAUCET_PRIVATE_KEY;
    if (!privateKey) {
      console.error("[Faucet] FAUCET_PRIVATE_KEY not configured");
      return NextResponse.json(
        { success: false, error: "Faucet not configured. Please contact admin." },
        { status: 500 }
      );
    }

    // Initialize Supabase
    const supabase = getSupabase();

    // Check if wallet has already claimed
    const { data: existingClaim, error: checkError } = await supabase
      .from("faucet_claims")
      .select("id, claimed_at, tx_hash")
      .eq("wallet_address", normalizedAddress)
      .single();

    if (existingClaim) {
      return NextResponse.json(
        {
          success: false,
          error: "This wallet has already claimed from the faucet",
          alreadyClaimed: true,
          claimedAt: existingClaim.claimed_at,
          txHash: existingClaim.tx_hash,
        },
        { status: 400 }
      );
    }

    // Initialize provider and wallet
    const provider = new ethers.JsonRpcProvider(ARC_RPC);
    const formattedKey = privateKey.startsWith("0x") ? privateKey : `0x${privateKey}`;
    const faucetWallet = new ethers.Wallet(formattedKey, provider);

    // Check faucet USDC balance
    const usdcContract = new ethers.Contract(USDC_ADDRESS, ERC20_ABI, faucetWallet);
    const faucetBalance = await usdcContract.balanceOf(faucetWallet.address);
    
    if (BigInt(faucetBalance) < BigInt(FAUCET_AMOUNT)) {
      console.error("[Faucet] Insufficient balance:", ethers.formatUnits(faucetBalance, 6));
      return NextResponse.json(
        { success: false, error: "Faucet is empty. Please try again later." },
        { status: 503 }
      );
    }

    // Send USDC to user
    console.log(`[Faucet] Sending ${FAUCET_AMOUNT_DISPLAY} USDC to ${normalizedAddress}`);
    
    const tx = await usdcContract.transfer(normalizedAddress, FAUCET_AMOUNT);
    console.log(`[Faucet] Transaction submitted: ${tx.hash}`);

    // Wait for confirmation
    const receipt = await tx.wait();
    console.log(`[Faucet] Transaction confirmed in block ${receipt.blockNumber}`);

    // Record claim in database
    const { error: insertError } = await supabase.from("faucet_claims").insert({
      wallet_address: normalizedAddress,
      amount: FAUCET_AMOUNT_DISPLAY,
      tx_hash: tx.hash,
      claimed_at: new Date().toISOString(),
    });

    if (insertError) {
      console.error("[Faucet] Failed to record claim:", insertError);
      // Transaction already sent, so still return success
    }

    return NextResponse.json({
      success: true,
      message: `Successfully sent ${FAUCET_AMOUNT_DISPLAY} USDC to your wallet!`,
      txHash: tx.hash,
      amount: FAUCET_AMOUNT_DISPLAY,
      explorerUrl: `https://testnet.arcscan.app/tx/${tx.hash}`,
    });

  } catch (error: any) {
    console.error("[Faucet] Error:", error);
    
    // Handle specific errors
    if (error.code === "INSUFFICIENT_FUNDS") {
      return NextResponse.json(
        { success: false, error: "Faucet has insufficient gas. Please try again later." },
        { status: 503 }
      );
    }
    
    if (error.code === "NETWORK_ERROR") {
      return NextResponse.json(
        { success: false, error: "Network error. Please try again." },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Failed to process request. Please try again." },
      { status: 500 }
    );
  }
}

// GET endpoint to check claim status
export async function GET(request: NextRequest) {
  // ═══════════════════════════════════════════════════════════════════════════════
  // EMERGENCY DISABLE - Faucet temporarily shut down due to abuse
  // ═══════════════════════════════════════════════════════════════════════════════
  if (!FAUCET_ENABLED) {
    return NextResponse.json(
      { 
        success: false, 
        error: "Faucet temporarily disabled for maintenance",
        disabled: true,
        hasClaimed: false
      },
      { status: 503 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const walletAddress = searchParams.get("wallet");

    if (!walletAddress || !isValidAddress(walletAddress)) {
      return NextResponse.json(
        { success: false, error: "Invalid wallet address" },
        { status: 400 }
      );
    }

    const normalizedAddress = walletAddress.toLowerCase();
    const supabase = getSupabase();

    // Check if wallet has claimed
    const { data: claim, error } = await supabase
      .from("faucet_claims")
      .select("*")
      .eq("wallet_address", normalizedAddress)
      .single();

    if (claim) {
      return NextResponse.json({
        success: true,
        hasClaimed: true,
        claimedAt: claim.claimed_at,
        txHash: claim.tx_hash,
        amount: claim.amount,
      });
    }

    return NextResponse.json({
      success: true,
      hasClaimed: false,
    });

  } catch (error) {
    console.error("[Faucet] Check error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to check claim status" },
      { status: 500 }
    );
  }
}
