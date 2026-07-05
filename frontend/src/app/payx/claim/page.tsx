"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAccount, useWriteContract } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { 
  Wallet, 
  CheckCircle2, 
  Loader2, 
  ArrowLeft,
  Gift,
  AlertCircle,
  ExternalLink,
  Sparkles,
  TrendingUp
} from "lucide-react";
import { PayXTippingABI, PAYX_CONTRACT_ADDRESS } from "@/config/abis/PayXTipping";
import { ConfettiEffect } from "@/components/ui/ConfettiEffect";

// X Icon Component
const XIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

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
  const [txHash, setTxHash] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  
  const { address, isConnected } = useAccount();
  const { writeContractAsync } = useWriteContract();

  // Show toast notification
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch(`/api/payx/auth/me`, {
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
      const res = await fetch(`/api/payx/tips/${handle}`);
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
      const res = await fetch(`/api/payx/auth/twitter`, {
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

  const handleClaim = async () => {
    if (!address || !user) return;
    
    try {
      setStep("claim");
      setError(null);
      setTxHash(null);
      
      showToast("🔐 Generating claim signature...", "info");
      
      const res = await fetch(`/api/payx/claim/sign`, {
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
      
      showToast("📝 Waiting for wallet confirmation...", "info");
      
      const hash = await writeContractAsync({
        address: PAYX_CONTRACT_ADDRESS,
        abi: PayXTippingABI,
        functionName: "claimTips",
        args: [
          data.handle,
          data.walletAddress as `0x${string}`,
          data.nonce as `0x${string}`,
          data.signature as `0x${string}`,
        ],
      });
      
      setTxHash(hash);
      showToast("⏳ Transaction submitted! Waiting for confirmation...", "info");
      
      // Wait for confirmation
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
      
      setStep("success");
      setShowConfetti(true);
      showToast("🎉 Tips claimed successfully!", "success");
      if (user) {
        await fetchTipInfo(user.handle);
      }
      
    } catch (err: any) {
      console.error("[PayX] Claim error:", err);
      setError(err.message || "Failed to claim tips");
      setStep("tips");
    }
  };

  const handleLogout = async () => {
    try {
      await fetch(`/api/payx/auth/logout`, {
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
    <main className="min-h-screen flex flex-col relative bg-[#0f172a]">
      {/* Confetti Effect */}
      <ConfettiEffect show={showConfetti} onComplete={() => setShowConfetti(false)} />

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-24 right-4 z-[90] payx-animate-fade-in-scale ${
          toast.type === 'success' ? 'bg-green-500/10 border-green-500/30' :
          toast.type === 'error' ? 'bg-red-500/10 border-red-500/30' :
          'bg-blue-500/10 border-blue-500/30'
        } border backdrop-blur-xl rounded-2xl p-4 shadow-2xl max-w-sm`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              toast.type === 'success' ? 'bg-green-500/20' :
              toast.type === 'error' ? 'bg-red-500/20' :
              'bg-blue-500/20'
            }`}>
              {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-green-400" /> :
               toast.type === 'error' ? <AlertCircle className="w-5 h-5 text-red-400" /> :
               <Sparkles className="w-5 h-5 text-blue-400" />}
            </div>
            <p className={`text-sm font-medium ${
              toast.type === 'success' ? 'text-green-300' :
              toast.type === 'error' ? 'text-red-300' :
              'text-blue-300'
            }`}>{toast.message}</p>
          </div>
        </div>
      )}

      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="payx-orb payx-orb-primary w-[500px] h-[500px] -top-32 -right-32 payx-animate-float" />
        <div className="payx-orb payx-orb-secondary w-[400px] h-[400px] bottom-0 -left-32 payx-animate-float" style={{ animationDelay: '3s' }} />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 payx-glass-strong" style={{ isolation: 'isolate' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20 gap-4">
            <Link href="/payx" className="flex items-center space-x-3 group flex-shrink-0 relative z-10">
              <div className="relative">
                <Image 
                  src="/branding/payx/payx-icon-gradient.svg" 
                  alt="PayX" 
                  width={40} 
                  height={40} 
                />
              </div>
              <span className="text-2xl font-bold tracking-tight text-white">PayX</span>
            </Link>
            <div className="flex-shrink-0 relative z-30">
              <ConnectButton />
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="relative z-10 flex-1 flex items-center justify-center p-4 py-12">
        <div className="w-full max-w-md">
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-center space-x-3 payx-animate-fade-in-scale">
              <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-5 h-5 text-red-400" />
              </div>
              <span className="text-red-300 text-sm">{error}</span>
            </div>
          )}

          {step === "connect" && !user && (
            <div className="payx-card payx-animate-fade-in-scale">
              <div className="text-center">
                <div className="relative inline-block mb-8">
                  <div className="absolute inset-0 bg-blue-500/30 rounded-3xl blur-xl" />
                  <div className="relative w-20 h-20 bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl flex items-center justify-center shadow-2xl shadow-black/30">
                    <XIcon className="w-10 h-10 text-white" />
                  </div>
                </div>
                
                <h1 className="text-3xl font-bold mb-3 text-white">Claim Your Tips</h1>
                <p className="text-gray-400 mb-10 text-lg">
                  Sign in with X to see and claim tips sent to your handle.
                </p>
                
                <button onClick={handleTwitterLogin} className="payx-btn-primary w-full text-lg py-4 flex items-center justify-center space-x-3 group">
                  <XIcon className="w-5 h-5" />
                  <span>Sign in with X</span>
                </button>
                
                <p className="mt-6 text-gray-500 text-sm">
                  We only access your public profile information
                </p>
              </div>
            </div>
          )}

          {step === "loading" && (
            <div className="payx-card text-center payx-animate-fade-in-scale">
              <div className="relative inline-block mb-6">
                <div className="w-16 h-16 border-4 border-[#01C38E]/20 rounded-full" />
                <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-[#01C38E] rounded-full animate-spin" />
              </div>
              <p className="text-gray-400 text-lg">Loading your tips...</p>
            </div>
          )}

          {step === "tips" && user && tipInfo && (
            <div className="payx-card payx-animate-fade-in-scale">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <div className="w-14 h-14 bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl flex items-center justify-center shadow-lg shadow-black/20">
                      <XIcon className="w-7 h-7 text-white" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-3 border-[#0f172a] flex items-center justify-center">
                      <CheckCircle2 className="w-3 h-3 text-white" />
                    </div>
                  </div>
                  <div>
                    <p className="font-bold text-lg text-white">{user.name || user.handle}</p>
                    <p className="text-gray-400">@{user.handle}</p>
                  </div>
                </div>
                <button onClick={handleLogout} className="payx-btn-ghost text-sm">
                  Logout
                </button>
              </div>

              <div className="relative mb-8 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-[#132D46]/20 via-[#0A786A]/20 to-[#01C38E]/20 rounded-2xl" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-2xl" />
                <div className="relative p-8 text-center">
                  <p className="text-gray-400 text-sm font-medium mb-2 uppercase tracking-wider">Pending Tips</p>
                  <p className="text-6xl font-bold bg-gradient-to-r from-[#132D46] via-[#0A786A] to-[#01C38E] bg-clip-text text-transparent mb-2">
                    ${parseFloat(tipInfo.pendingBalance).toFixed(2)}
                  </p>
                  <div className="flex items-center justify-center gap-2 text-gray-400">
                    <Image src="/tokens/usdc.png" alt="USDC" width={20} height={20} className="rounded-full" />
                    <span>USDC</span>
                  </div>
                </div>
              </div>

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
                  <p className="text-2xl font-bold text-[#01C38E]">${parseFloat(tipInfo.totalClaimed).toFixed(0)}</p>
                  <p className="text-gray-500 text-xs mt-1">Claimed</p>
                </div>
              </div>

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
                    <button onClick={handleClaim} className="payx-btn-primary w-full text-lg py-4 flex items-center justify-center space-x-3 group payx-animate-pulse-glow">
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

          {step === "claim" && (
            <div className="payx-card text-center payx-animate-fade-in-scale">
              <div className="relative inline-block mb-6">
                <div className="w-20 h-20 border-4 border-[#01C38E]/20 rounded-full" />
                <div className="absolute inset-0 w-20 h-20 border-4 border-transparent border-t-[#01C38E] rounded-full animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Image src="/branding/payx/payx-icon-gradient.svg" alt="PayX" width={40} height={40} />
                </div>
              </div>
              <h2 className="text-2xl font-bold mb-3 text-white">Claiming Your Tips</h2>
              <p className="text-gray-400">Please confirm the transaction in your wallet...</p>
              <div className="mt-6 flex items-center justify-center space-x-2 text-gray-500 text-sm">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Waiting for confirmation</span>
              </div>
            </div>
          )}

          {step === "success" && claimData && (
            <div className="payx-card text-center payx-animate-fade-in-scale">
              <div className="relative inline-block mb-8">
                <div className="absolute inset-0 bg-green-500/30 rounded-3xl blur-xl animate-pulse" />
                <div className="relative w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-3xl flex items-center justify-center shadow-2xl shadow-green-500/30">
                  <CheckCircle2 className="w-10 h-10 text-white" />
                </div>
              </div>
              
              <h2 className="text-3xl font-bold mb-3 text-white">Tips Claimed!</h2>
              <p className="text-gray-400 mb-8 text-lg">
                Your tips have been sent to your wallet.
              </p>
              
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
                      className="font-mono text-sm text-[#01C38E] hover:text-[#01C38E]/80 transition-colors flex items-center gap-2"
                    >
                      {txHash.slice(0, 14)}...{txHash.slice(-10)}
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <Link href="/payx/dashboard" className="payx-btn-primary flex-1 py-3">
                  View Dashboard
                </Link>
                <button onClick={() => { setStep("tips"); setTxHash(null); }} className="payx-btn-secondary flex-1 py-3">
                  Done
                </button>
              </div>
            </div>
          )}

          <div className="mt-8 text-center">
            <Link href="/payx" className="inline-flex items-center space-x-2 text-gray-400 hover:text-white transition-colors group">
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span>Back to Home</span>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
