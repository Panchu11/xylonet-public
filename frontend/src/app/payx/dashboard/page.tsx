"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { 
  TrendingUp,
  TrendingDown,
  Users,
  Clock,
  Copy,
  Check,
  Loader2,
  Sparkles,
  Wallet,
  Gift,
  Download,
  Share2
} from "lucide-react";

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
  linkedWallet: string;
}

interface Tip {
  tipper: string;
  amount: string;
  date: string;
  message: string;
}

export default function DashboardPage() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [tipInfo, setTipInfo] = useState<TipInfo | null>(null);
  const [tips, setTips] = useState<Tip[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

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
        await Promise.all([
          fetchTipInfo(data.handle),
          fetchTipHistory(data.handle),
        ]);
      }
    } catch (err) {
      console.log("Not authenticated");
    } finally {
      setLoading(false);
    }
  };

  const fetchTipInfo = async (handle: string) => {
    try {
      const res = await fetch(`/api/payx/tips/${handle}`);
      if (res.ok) {
        const data = await res.json();
        setTipInfo(data);
      }
    } catch (err) {
      console.error("Failed to fetch tip info:", err);
    }
  };

  const fetchTipHistory = async (handle: string) => {
    try {
      const res = await fetch(`/api/payx/tips/${handle}/history?limit=10`);
      if (res.ok) {
        const data = await res.json();
        setTips(data.tips || []);
      }
    } catch (err) {
      console.error("Failed to fetch tip history:", err);
    }
  };

  const copyHandle = () => {
    if (user) {
      navigator.clipboard.writeText(`@${user.handle}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatAddress = (addr: string) => {
    if (!addr || addr === "0x0000000000000000000000000000000000000000") return "Not linked";
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="payx-orb payx-orb-primary w-[600px] h-[600px] top-1/4 left-1/4 payx-animate-pulse-slow" />
          <div className="payx-orb payx-orb-secondary w-[500px] h-[500px] bottom-1/4 right-1/4 payx-animate-pulse-slow" style={{ animationDelay: '1s' }} />
        </div>
        <div className="relative flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center animate-pulse">
            <Image src="/branding/payx/payx-icon-gradient.svg" alt="PayX" width={64} height={64} />
          </div>
          <div className="flex items-center gap-3 text-gray-400">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Loading your dashboard...</span>
          </div>
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center p-4">
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="payx-orb payx-orb-primary w-[600px] h-[600px] top-1/3 left-1/3 opacity-30" />
        </div>
        
        <div className="relative payx-glass-premium rounded-3xl p-10 max-w-md text-center border border-white/5">
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
          
          <div className="relative">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center shadow-lg shadow-black/25">
              <XIcon className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold mb-3 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">Sign In Required</h1>
            <p className="text-gray-400 mb-8 leading-relaxed">
              Please sign in with X to view your creator dashboard and manage your tips.
            </p>
            <Link 
              href="/payx/claim" 
              className="payx-btn-primary inline-flex items-center gap-2"
            >
              <XIcon className="w-5 h-5" />
              Sign In with X
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const pendingAmount = tipInfo ? parseFloat(tipInfo.pendingBalance) : 0;
  const totalReceived = tipInfo ? parseFloat(tipInfo.totalReceived) : 0;
  const totalClaimed = tipInfo ? parseFloat(tipInfo.totalClaimed) : 0;

  return (
    <main className="min-h-screen bg-[#0f172a]">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="payx-orb payx-orb-primary w-[800px] h-[800px] top-0 left-1/4 opacity-20 payx-animate-pulse-slow" />
        <div className="payx-orb payx-orb-secondary w-[600px] h-[600px] bottom-0 right-1/4 opacity-20 payx-animate-pulse-slow" style={{ animationDelay: '1s' }} />
      </div>

      {/* Navigation */}
      <nav className="relative payx-glass-premium border-b border-white/5 sticky top-0 z-50" style={{ isolation: 'isolate' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20 gap-4">
            <Link href="/payx" className="flex items-center space-x-3 group flex-shrink-0 relative z-10">
              <div className="relative">
                <Image 
                  src="/branding/payx/payx-icon-gradient.svg" 
                  alt="PayX" 
                  width={40} 
                  height={40} 
                  className="group-hover:scale-105 transition-transform"
                />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">PayX</span>
            </Link>
            <div className="flex items-center space-x-4 flex-shrink-0 relative z-30">
              <Link 
                href="/payx/claim" 
                className="hidden sm:flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all duration-300 text-sm font-medium"
              >
                <Gift className="w-4 h-4" />
                Claim Tips
              </Link>
              <ConnectButton />
            </div>
          </div>
        </div>
      </nav>

      {/* Dashboard Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Profile Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10 gap-6">
          <div className="flex items-center space-x-5">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-br from-gray-800 via-gray-800 to-gray-900 rounded-2xl flex items-center justify-center shadow-xl shadow-black/20">
                <XIcon className="w-10 h-10 text-white" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-lg flex items-center justify-center border-2 border-[#0f172a]">
                <Check className="w-3 h-3 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white mb-1">{user.name || user.handle}</h1>
              <button 
                onClick={copyHandle}
                className="flex items-center space-x-2 text-gray-400 hover:text-white transition group"
              >
                <span className="text-lg">@{user.handle}</span>
                {copied ? (
                  <Check className="w-4 h-4 text-green-400" />
                ) : (
                  <Copy className="w-4 h-4 opacity-50 group-hover:opacity-100 transition" />
                )}
              </button>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all duration-300 text-sm font-medium">
              <Share2 className="w-4 h-4" />
              <span>Share</span>
            </button>
            <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all duration-300 text-sm font-medium">
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* Hero Stats Card */}
        <div className="relative mb-8 rounded-3xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-[#132D46]/90 via-[#0A786A]/90 to-[#01C38E]/90" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full filter blur-3xl -translate-y-1/2 translate-x-1/2" />
          
          <div className="relative p-8 sm:p-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-white/70 text-sm font-medium">Available to Claim</p>
                <p className="text-xs text-white/50">Ready to withdraw</p>
              </div>
            </div>
            
            <div className="flex items-baseline gap-3 mb-8">
              <span className="text-6xl sm:text-7xl font-bold text-white tracking-tight">
                ${pendingAmount.toFixed(2)}
              </span>
              <div className="flex items-center gap-2">
                <Image src="/tokens/usdc.png" alt="USDC" width={28} height={28} className="rounded-full" />
                <span className="text-2xl text-white/60 font-medium">USDC</span>
              </div>
            </div>
            
            {pendingAmount > 0 && (
              <Link
                href="/payx/claim"
                className="payx-btn-primary inline-flex items-center gap-2 bg-white text-gray-900 hover:bg-gray-100"
              >
                Claim Now
              </Link>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-3 gap-5 mb-8">
          <div className="payx-glass-premium rounded-2xl p-6 border border-white/5 group hover:border-[#01C38E]/30 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <span className="text-gray-400 text-sm font-medium">Total Received</span>
              <div className="w-10 h-10 rounded-xl bg-[#01C38E]/10 flex items-center justify-center group-hover:bg-[#01C38E]/20 transition-colors">
                <TrendingUp className="w-5 h-5 text-[#01C38E]" />
              </div>
            </div>
            <p className="text-3xl font-bold text-white mb-1">${totalReceived.toFixed(2)}</p>
            <div className="flex items-center gap-2">
              <p className="text-sm text-gray-500">Lifetime earnings</p>
              <div className="flex items-center gap-1 text-xs font-semibold text-green-400 bg-green-500/10 px-2 py-1 rounded-full">
                <TrendingUp className="w-3 h-3" />
                <span>+12%</span>
              </div>
            </div>
          </div>
          
          <div className="payx-glass-premium rounded-2xl p-6 border border-white/5 group hover:border-green-500/30 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <span className="text-gray-400 text-sm font-medium">Total Claimed</span>
              <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center group-hover:bg-green-500/20 transition-colors">
                <Check className="w-5 h-5 text-green-400" />
              </div>
            </div>
            <p className="text-3xl font-bold text-white mb-1">${totalClaimed.toFixed(2)}</p>
            <div className="flex items-center gap-2">
              <p className="text-sm text-gray-500">Successfully withdrawn</p>
              <div className="flex items-center gap-1 text-xs font-semibold text-green-400 bg-green-500/10 px-2 py-1 rounded-full">
                <TrendingUp className="w-3 h-3" />
                <span>+8%</span>
              </div>
            </div>
          </div>
          
          <div className="payx-glass-premium rounded-2xl p-6 border border-white/5 group hover:border-[#01C38E]/30 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <span className="text-gray-400 text-sm font-medium">Total Tips</span>
              <div className="w-10 h-10 rounded-xl bg-[#01C38E]/10 flex items-center justify-center group-hover:bg-[#01C38E]/20 transition-colors">
                <Users className="w-5 h-5 text-[#01C38E]" />
              </div>
            </div>
            <p className="text-3xl font-bold text-white mb-1">{tipInfo?.tipCount || 0}</p>
            <p className="text-sm text-gray-500">From supporters</p>
          </div>
        </div>

        {/* Recent Tips */}
        <div className="payx-glass-premium rounded-2xl border border-white/5 overflow-hidden">
          <div className="p-6 border-b border-white/5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                </div>
                <h2 className="text-xl font-semibold text-white">Recent Tips</h2>
              </div>
              <span className="text-sm text-gray-500">{tips.length} tips</span>
            </div>
          </div>
          
          {tips.length === 0 ? (
            <div className="text-center py-16 px-4">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/5 flex items-center justify-center">
                <Clock className="w-8 h-8 text-gray-600" />
              </div>
              <p className="text-gray-400 font-medium mb-2">No tips received yet</p>
              <p className="text-gray-600 text-sm">Share your X handle to start receiving tips!</p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {tips.map((tip, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between p-5 hover:bg-white/[0.02] transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#0A786A] to-[#01C38E] rounded-xl flex items-center justify-center shadow-lg shadow-[#01C38E]/20 p-2">
                      <Image src="/tokens/usdc.png" alt="USDC" width={32} height={32} className="rounded-full" />
                    </div>
                    <div>
                      <p className="font-semibold text-white text-lg">
                        ${parseFloat(tip.amount).toFixed(2)} USDC
                      </p>
                      <p className="text-gray-500 text-sm">
                        From {formatAddress(tip.tipper)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-500 text-sm mb-1">{formatDate(tip.date)}</p>
                    {tip.message && (
                      <p className="text-gray-400 text-sm max-w-xs truncate italic">
                        "{tip.message}"
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
