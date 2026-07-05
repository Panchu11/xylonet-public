"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { 
  DollarSign,
  Wallet, 
  CheckCircle2, 
  Loader2, 
  ArrowLeft,
  Gift,
  AlertCircle,
  ExternalLink
} from "lucide-react";
import { parseUnits } from "viem";

// X Icon Component
const XIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

// API URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

// Contract addresses (Real Circle USDC)
const PAYX_CONTRACT = "0xA312c384770B7b49E371DF4b7AF730EFEF465913";

// PayX Contract ABI (only claimTips function)
const PAYX_ABI = [
  {
    "inputs": [
      { "internalType": "string", "name": "handle", "type": "string" },
      { "internalType": "address", "name": "wallet", "type": "address" },
      { "internalType": "bytes32", "name": "nonce", "type": "bytes32" },
      { "internalType": "bytes", "name": "signature", "type": "bytes" }
    ],
    "name": "claimTips",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const;

interface UserInfo {
  handle: string;
  name: string;
  profileImage?: string;
}

interface TipInfo {
  handle: string;
  pendingBalance: string;
  totalReceived: string;
  totalClaimed: string;
  tipCount: number;
  isRegistered: boolean;
}

export default function ClaimPage() {
  const [step, setStep] = useState<"connect" | "loading" | "tips" | "claim" | "success">("connect");
  const [user, setUser] = useState<UserInfo | null>(null);
  const [tipInfo, setTipInfo] = useState<TipInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [claimData, setClaimData] = useState<any>(null);
  
  const { address, isConnected } = useAccount();

  // Check if user is already authenticated
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch(`${API_URL}/api/auth/me`, {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data);
        await fetchTipInfo(data.handle);
      }
    } catch (err) {
      console.log("Not authenticated");
    }
  };

  const fetchTipInfo = async (handle: string) => {
    try {
      setStep("loading");
      const res = await fetch(`${API_URL}/api/tips/${handle}`);
      if (res.ok) {
        const data = await res.json();
        setTipInfo(data);
        setStep("tips");
      } else {
        setError("Failed to fetch tip information");
      }
    } catch (err) {
      setError("Failed to connect to server");
    }
  };

  const handleTwitterLogin = async () => {
    try {
      const res = await fetch(`${API_URL}/api/auth/twitter`, {
        credentials: "include",
      });
      const data = await res.json();
      if (data.authUrl) {
        window.location.href = data.authUrl;
      }
    } catch (err) {
      setError("Failed to initiate Twitter login");
    }
  };

  const [txHash, setTxHash] = useState<string | null>(null);
  
  // Contract write hook
  const { writeContractAsync, isPending: isWritePending } = useWriteContract();

  const handleClaim = async () => {
    if (!address || !user) return;
    
    try {
      setStep("claim");
      setError(null);
      setTxHash(null);
      
      // Get claim signature from backend
      const res = await fetch(`${API_URL}/api/claim/sign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ walletAddress: address }),
      });
      
      if (!res.ok) {
        throw new Error("Failed to get claim signature");
      }
      
      const { data } = await res.json();
      setClaimData(data);
      
      console.log("[PayX] Claim data from backend:", data);
      
      // Call the smart contract claimTips function
      const hash = await writeContractAsync({
        address: PAYX_CONTRACT,
        abi: PAYX_ABI,
        functionName: "claimTips",
        args: [
          data.handle,
          data.walletAddress as `0x${string}`,
          data.nonce as `0x${string}`,
          data.signature as `0x${string}`,
        ],
      });
      
      console.log("[PayX] Claim transaction submitted:", hash);
      setTxHash(hash);
      
      // Wait for confirmation (simple polling)
      let confirmed = false;
      for (let i = 0; i < 30; i++) {
        await new Promise(r => setTimeout(r, 2000));
        try {
          const receipt = await fetch(`https://rpc.testnet.arc.network`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              jsonrpc: "2.0",
              method: "eth_getTransactionReceipt",
              params: [hash],
              id: 1,
            }),
          }).then(r => r.json());
          
          if (receipt.result && receipt.result.status === "0x1") {
            confirmed = true;
            break;
          } else if (receipt.result && receipt.result.status === "0x0") {
            throw new Error("Transaction failed on chain");
          }
        } catch (e) {
          console.log("Waiting for confirmation...");
        }
      }
      
      if (confirmed) {
        setStep("success");
        // Refresh tip info
        if (user) {
          await fetchTipInfo(user.handle);
        }
      } else {
        setStep("success"); // Show success anyway, user can check explorer
      }
      
    } catch (err: any) {
      console.error("[PayX] Claim error:", err);
      setError(err.message || "Failed to claim tips");
      setStep("tips");
    }
  };

  const handleLogout = async () => {
    try {
      await fetch(`${API_URL}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
      setUser(null);
      setTipInfo(null);
      setStep("connect");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  return (
    <main className="min-h-screen flex flex-col overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="orb orb-primary w-[500px] h-[500px] -top-32 -right-32 animate-float" />
        <div className="orb orb-secondary w-[400px] h-[400px] bottom-0 -left-32 animate-float" style={{ animationDelay: '3s' }} />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 glass-strong">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="relative">
                <Image 
                  src="/logo.png" 
                  alt="PayX" 
                  width={40} 
                  height={40} 
                  className="rounded-xl shadow-lg shadow-indigo-500/30"
                />
              </div>
              <span className="text-2xl font-bold tracking-tight">PayX</span>
            </Link>
            <ConnectButton />
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="relative z-10 flex-1 flex items-center justify-center p-4 py-12">
        <div className="w-full max-w-md">
          {/* Error Alert */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-center space-x-3 animate-fade-in-scale">
              <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-5 h-5 text-red-400" />
              </div>
              <span className="text-red-300 text-sm">{error}</span>
            </div>
          )}

          {/* Step: Connect with Twitter */}
          {step === "connect" && !user && (
            <div className="card animate-fade-in-scale">
              <div className="text-center">
                {/* Icon with glow */}
                <div className="relative inline-block mb-8">
                  <div className="absolute inset-0 bg-blue-500/30 rounded-3xl blur-xl" />
                  <div className="relative w-20 h-20 bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl flex items-center justify-center shadow-2xl shadow-black/30">
                    <XIcon className="w-10 h-10 text-white" />
                  </div>
                </div>
                
                <h1 className="text-3xl font-bold mb-3">Claim Your Tips</h1>
                <p className="text-gray-400 mb-10 text-lg">
                  Sign in with X to see and claim tips sent to your handle.
                </p>
                
                <button onClick={handleTwitterLogin} className="btn-primary w-full text-lg py-4 flex items-center justify-center space-x-3 group">
                  <XIcon className="w-5 h-5" />
                  <span>Sign in with X</span>
                </button>
                
                <p className="mt-6 text-gray-500 text-sm">
                  We only access your public profile information
                </p>
              </div>
            </div>
          )}

          {/* Step: Loading */}
          {step === "loading" && (
            <div className="card text-center animate-fade-in-scale">
              <div className="relative inline-block mb-6">
                <div className="w-16 h-16 border-4 border-indigo-500/20 rounded-full" />
                <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-indigo-500 rounded-full animate-spin" />
              </div>
              <p className="text-gray-400 text-lg">Loading your tips...</p>
            </div>
          )}

          {/* Step: Show Tips */}
          {step === "tips" && user && tipInfo && (
            <div className="card animate-fade-in-scale">
              {/* User Info */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <div className="w-14 h-14 bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl flex items-center justify-center shadow-lg shadow-black/20">
                      <XIcon className="w-7 h-7 text-white" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-3 border-[rgb(15,15,35)] flex items-center justify-center">
                      <CheckCircle2 className="w-3 h-3 text-white" />
                    </div>
                  </div>
                  <div>
                    <p className="font-bold text-lg">{user.name || user.handle}</p>
                    <p className="text-gray-400">@{user.handle}</p>
                  </div>
                </div>
                <button onClick={handleLogout} className="btn-ghost text-sm">
                  Logout
                </button>
              </div>

              {/* Pending Balance - Hero Card */}
              <div className="relative mb-8 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-cyan-500/20 rounded-2xl" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-2xl" />
                <div className="relative p-8 text-center">
                  <p className="text-gray-400 text-sm font-medium mb-2 uppercase tracking-wider">Pending Tips</p>
                  <p className="text-6xl font-bold gradient-text mb-2">
                    ${parseFloat(tipInfo.pendingBalance).toFixed(2)}
                  </p>
                  <p className="text-gray-400">USDC</p>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-3 mb-8">
                <div className="bg-white/5 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-white">{tipInfo.tipCount}</p>
                  <p className="text-gray-500 text-xs mt-1">Total Tips</p>
                </div>
                <div className="bg-white/5 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-green-400">${parseFloat(tipInfo.totalReceived).toFixed(0)}</p>
                  <p className="text-gray-500 text-xs mt-1">Received</p>
                </div>
                <div className="bg-white/5 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-indigo-400">${parseFloat(tipInfo.totalClaimed).toFixed(0)}</p>
                  <p className="text-gray-500 text-xs mt-1">Claimed</p>
                </div>
              </div>

              {/* Claim Button */}
              {parseFloat(tipInfo.pendingBalance) > 0 ? (
                <>
                  {!isConnected ? (
                    <div className="space-y-4">
                      <p className="text-center text-gray-400 text-sm">
                        Connect your wallet to claim tips
                      </p>
                      <div className="flex justify-center">
                        <ConnectButton />
                      </div>
                    </div>
                  ) : (
                    <button onClick={handleClaim} className="btn-primary w-full text-lg py-4 flex items-center justify-center space-x-3 group animate-pulse-glow">
                      <Gift className="w-5 h-5" />
                      <span>Claim ${parseFloat(tipInfo.pendingBalance).toFixed(2)} USDC</span>
                    </button>
                  )}
                </>
              ) : (
                <div className="text-center py-4">
                  <div className="w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Gift className="w-6 h-6 text-gray-500" />
                  </div>
                  <p className="text-gray-400">No pending tips to claim</p>
                  <p className="text-gray-500 text-sm mt-1">Share your X handle to receive tips!</p>
                </div>
              )}
            </div>
          )}

          {/* Step: Claiming */}
          {step === "claim" && (
            <div className="card text-center animate-fade-in-scale">
              <div className="relative inline-block mb-6">
                <div className="w-20 h-20 border-4 border-indigo-500/20 rounded-full" />
                <div className="absolute inset-0 w-20 h-20 border-4 border-transparent border-t-indigo-500 rounded-full animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Image src="/logo.png" alt="PayX" width={40} height={40} className="rounded-lg" />
                </div>
              </div>
              <h2 className="text-2xl font-bold mb-3">Claiming Your Tips</h2>
              <p className="text-gray-400">Please confirm the transaction in your wallet...</p>
              <div className="mt-6 flex items-center justify-center space-x-2 text-gray-500 text-sm">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Waiting for confirmation</span>
              </div>
            </div>
          )}

          {/* Step: Success */}
          {step === "success" && claimData && (
            <div className="card text-center animate-fade-in-scale">
              {/* Success Icon with celebration effect */}
              <div className="relative inline-block mb-8">
                <div className="absolute inset-0 bg-green-500/30 rounded-3xl blur-xl animate-pulse" />
                <div className="relative w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-3xl flex items-center justify-center shadow-2xl shadow-green-500/30">
                  <CheckCircle2 className="w-10 h-10 text-white" />
                </div>
              </div>
              
              <h2 className="text-3xl font-bold mb-3">Tips Claimed!</h2>
              <p className="text-gray-400 mb-8 text-lg">
                Your tips have been sent to your wallet.
              </p>
              
              {/* Details */}
              <div className="space-y-3 mb-8">
                <div className="bg-white/5 rounded-xl p-4 text-left">
                  <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Wallet</p>
                  <p className="font-mono text-sm break-all text-gray-300">{claimData.walletAddress}</p>
                </div>
                
                {txHash && (
                  <div className="bg-white/5 rounded-xl p-4 text-left">
                    <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Transaction</p>
                    <a 
                      href={`https://testnet.arcscan.app/tx/${txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-sm text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-2"
                    >
                      {txHash.slice(0, 14)}...{txHash.slice(-10)}
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <Link href="/dashboard" className="btn-primary flex-1 py-3">
                  View Dashboard
                </Link>
                <button onClick={() => { setStep("tips"); setTxHash(null); }} className="btn-secondary flex-1 py-3">
                  Done
                </button>
              </div>
            </div>
          )}

          {/* Back Link */}
          <div className="mt-8 text-center">
            <Link href="/" className="inline-flex items-center space-x-2 text-gray-400 hover:text-white transition-colors group">
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span>Back to Home</span>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
