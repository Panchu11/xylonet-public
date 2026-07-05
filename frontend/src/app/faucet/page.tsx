"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { 
  Droplets, 
  Wallet, 
  CheckCircle2, 
  Loader2, 
  AlertCircle,
  ExternalLink,
  Sparkles,
  ArrowRight,
  Gift,
  Zap,
  Shield,
  Clock
} from "lucide-react";
import { TiltCard } from "@/components/ui/TiltCard";

interface ClaimStatus {
  hasClaimed: boolean;
  claimedAt?: string;
  txHash?: string;
  amount?: string;
}

export default function FaucetPage() {
  const [walletInput, setWalletInput] = useState("");
  const [status, setStatus] = useState<"idle" | "checking" | "claiming" | "success" | "error" | "already-claimed">("idle");
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [claimInfo, setClaimInfo] = useState<ClaimStatus | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0.5, y: 0.5 });
  
  const { address, isConnected } = useAccount();

  // Mouse tracking for background effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Auto-fill wallet address when connected
  useEffect(() => {
    if (isConnected && address) {
      setWalletInput(address);
      checkClaimStatus(address);
    }
  }, [isConnected, address]);

  const checkClaimStatus = async (wallet: string) => {
    try {
      const res = await fetch(`/api/faucet/claim?wallet=${wallet}`);
      const data = await res.json();
      
      if (data.success && data.hasClaimed) {
        setClaimInfo(data);
        setStatus("already-claimed");
      } else {
        setClaimInfo(null);
        setStatus("idle");
      }
    } catch (err) {
      console.error("Failed to check claim status:", err);
    }
  };

  const isValidAddress = (addr: string) => /^0x[a-fA-F0-9]{40}$/.test(addr);

  const handleClaim = async () => {
    const wallet = walletInput.trim();
    
    if (!isValidAddress(wallet)) {
      setError("Please enter a valid wallet address");
      setStatus("error");
      return;
    }

    setStatus("claiming");
    setError(null);
    setTxHash(null);

    try {
      const res = await fetch("/api/faucet/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletAddress: wallet }),
      });

      const data = await res.json();

      if (data.success) {
        setTxHash(data.txHash);
        setStatus("success");
      } else if (data.alreadyClaimed) {
        setClaimInfo({
          hasClaimed: true,
          claimedAt: data.claimedAt,
          txHash: data.txHash,
        });
        setStatus("already-claimed");
      } else {
        setError(data.error || "Failed to claim. Please try again.");
        setStatus("error");
      }
    } catch (err) {
      console.error("Claim error:", err);
      setError("Network error. Please try again.");
      setStatus("error");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setWalletInput(value);
    setStatus("idle");
    setError(null);
    
    if (isValidAddress(value)) {
      checkClaimStatus(value);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col relative overflow-hidden">
      {/* Cinematic Background */}
      <div className="absolute inset-0 bg-[#0f172a]">
        <div 
          className="absolute w-[1000px] h-[1000px] rounded-full opacity-20 blur-[150px] transition-all duration-700"
          style={{
            background: 'radial-gradient(circle, rgba(59,130,246,0.8) 0%, rgba(6,182,212,0.4) 50%, transparent 70%)',
            top: `calc(${mousePosition.y * 100}% - 500px)`,
            left: `calc(${mousePosition.x * 100}% - 500px)`,
          }}
        />
        <div 
          className="absolute w-[800px] h-[800px] rounded-full opacity-15 blur-[120px] transition-all duration-1000"
          style={{
            background: 'radial-gradient(circle, rgba(16,185,129,0.6) 0%, rgba(139,92,246,0.3) 60%, transparent 70%)',
            bottom: `calc(${(1-mousePosition.y) * 80}% - 400px)`,
            right: `calc(${(1-mousePosition.x) * 80}% - 400px)`,
          }}
        />
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)`,
          backgroundSize: '80px 80px',
        }} />
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#01C38E]/10 border border-[#01C38E]/20 mb-4">
              <Droplets className="w-4 h-4 text-[#01C38E]" />
              <span className="text-sm font-medium text-[#01C38E]">Arc Testnet Faucet</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
              Get Testnet <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#01C38E] to-[#01C38E]">USDC</span>
            </h1>
            <p className="text-[var(--text-secondary)]">
              Claim 2 USDC to start exploring XyloNet
            </p>
          </div>

          {/* Main Card */}
          <TiltCard className="w-full" tiltAmount={3}>
            <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-6 backdrop-blur-xl">
              
              {/* Success State */}
              {status === "success" && txHash && (
                <div className="text-center py-6">
                  <div className="relative inline-block mb-4">
                    <div className="absolute inset-0 bg-[#0A786A]/30 rounded-full blur-xl animate-pulse" />
                    <div className="relative w-16 h-16 bg-gradient-to-br from-[#0A786A] to-[#01C38E] rounded-full flex items-center justify-center">
                      <CheckCircle2 className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  
                  <h2 className="text-xl font-bold text-white mb-2">2 USDC Sent!</h2>
                  <p className="text-[var(--text-secondary)] mb-4 text-sm">Your testnet USDC is on its way.</p>
                  
                  <a 
                    href={`https://testnet.arcscan.app/tx/${txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-[#01C38E] hover:text-[#01C38E] transition-colors mb-6"
                  >
                    View on ArcScan
                    <ExternalLink className="w-3 h-3" />
                  </a>

                  <div className="flex gap-3">
                    <Link href="/swap" className="flex-1 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-medium py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2">
                      Start Swapping
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              )}

              {/* Already Claimed State */}
              {status === "already-claimed" && claimInfo && (
                <div className="text-center py-6">
                  <div className="w-16 h-16 bg-[var(--card-border)] rounded-full flex items-center justify-center mx-auto mb-4">
                    <Gift className="w-8 h-8 text-[var(--text-secondary)]" />
                  </div>
                  
                  <h2 className="text-xl font-bold text-white mb-2">Already Claimed</h2>
                  <p className="text-[var(--text-secondary)] mb-4 text-sm">This wallet has already received USDC.</p>
                  
                  {claimInfo.txHash && (
                    <a 
                      href={`https://testnet.arcscan.app/tx/${claimInfo.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm text-[#01C38E] hover:text-[#01C38E] transition-colors mb-6"
                    >
                      View Previous Claim
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}

                  <Link href="/swap" className="w-full bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-medium py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2">
                    Go to Swap
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              )}

              {/* Claim Form */}
              {(status === "idle" || status === "checking" || status === "claiming" || status === "error") && (
                <>
                  {/* Amount Display */}
                  <div className="flex items-center justify-center gap-3 p-4 bg-[var(--card-border)]/50 rounded-xl mb-6">
                    <Image src="/tokens/usdc.png" alt="USDC" width={40} height={40} className="rounded-full" />
                    <div>
                      <p className="text-2xl font-bold text-white">2 USDC</p>
                      <p className="text-xs text-[var(--text-secondary)]">One-time per wallet</p>
                    </div>
                  </div>

                  {/* Error Message */}
                  {status === "error" && error && (
                    <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3">
                      <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                      <span className="text-red-400 text-sm">{error}</span>
                    </div>
                  )}

                  {/* Wallet Input */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                      Wallet Address
                    </label>
                    <div className="relative">
                      <Wallet className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-secondary)]" />
                      <input
                        type="text"
                        value={walletInput}
                        onChange={handleInputChange}
                        placeholder="0x..."
                        className="w-full bg-[var(--card-border)]/50 border border-[var(--card-border)] rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:border-[var(--primary)] focus:outline-none transition-colors font-mono text-sm"
                        disabled={status === "claiming"}
                      />
                      {isConnected && address && walletInput !== address && (
                        <button
                          onClick={() => {
                            setWalletInput(address);
                            checkClaimStatus(address);
                          }}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-xs bg-[var(--primary)]/20 text-[var(--primary)] px-2 py-1 rounded-lg hover:bg-[var(--primary)]/30 transition-colors"
                        >
                          Use Connected
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Faucet Temporarily Paused Notice */}
                  <div className="mb-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl flex items-center gap-3">
                    <AlertCircle className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                    <span className="text-yellow-400 text-sm">Faucet temporarily paused for maintenance</span>
                  </div>

                  {/* Submit Button - DISABLED */}
                  <button
                    disabled={true}
                    className="w-full bg-gray-600 text-gray-400 font-semibold py-3 px-4 rounded-xl cursor-not-allowed flex items-center justify-center gap-2 opacity-50"
                  >
                    <Droplets className="w-5 h-5" />
                    Faucet Paused
                  </button>

                  <p className="text-center text-[var(--text-secondary)] text-xs mt-3">
                    Please check back later or use Circle Faucet below
                  </p>
                </>
              )}
            </div>
          </TiltCard>

          {/* Features */}
          <div className="grid grid-cols-3 gap-3 mt-6">
            <div className="bg-[var(--card-bg)]/50 border border-[var(--card-border)] rounded-xl p-3 text-center">
              <Zap className="w-5 h-5 text-yellow-400 mx-auto mb-1" />
              <p className="text-xs text-white font-medium">Instant</p>
              <p className="text-[10px] text-[var(--text-secondary)]">&lt;1 sec</p>
            </div>
            <div className="bg-[var(--card-bg)]/50 border border-[var(--card-border)] rounded-xl p-3 text-center">
              <Shield className="w-5 h-5 text-[#01C38E] mx-auto mb-1" />
              <p className="text-xs text-white font-medium">Free</p>
              <p className="text-[10px] text-[var(--text-secondary)]">No gas</p>
            </div>
            <div className="bg-[var(--card-bg)]/50 border border-[var(--card-border)] rounded-xl p-3 text-center">
              <Clock className="w-5 h-5 text-[#01C38E] mx-auto mb-1" />
              <p className="text-xs text-white font-medium">One-time</p>
              <p className="text-[10px] text-[var(--text-secondary)]">Per wallet</p>
            </div>
          </div>

          {/* Info Box */}
          <div className="mt-6 p-4 bg-[var(--card-bg)]/30 border border-[var(--card-border)] rounded-xl">
            <h3 className="text-white font-medium mb-2 flex items-center gap-2 text-sm">
              <Sparkles className="w-4 h-4 text-[#01C38E]" />
              What can you do?
            </h3>
            <ul className="space-y-1.5 text-[var(--text-secondary)] text-xs">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3 h-3 text-[#01C38E]" />
                Swap USDC, EURC, USYC
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3 h-3 text-[#01C38E]" />
                Provide liquidity & earn fees
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3 h-3 text-[#01C38E]" />
                Bridge to other chains
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3 h-3 text-[#01C38E]" />
                Tip creators with PayX
              </li>
            </ul>
          </div>

          {/* Circle Faucet Link */}
          <p className="text-center text-[var(--text-secondary)] text-xs mt-4">
            Need more? Visit{" "}
            <a 
              href="https://faucet.circle.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-[#01C38E] hover:text-[#01C38E] transition-colors"
            >
              Circle Faucet
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
