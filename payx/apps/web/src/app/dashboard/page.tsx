"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { 
  DollarSign, 
  TrendingUp,
  Users,
  Clock,
  ExternalLink,
  Copy,
  Check,
  Loader2,
  Sparkles,
  ArrowUpRight,
  Wallet,
  Zap,
  Gift
} from "lucide-react";

// X Icon Component
const XIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

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
  
  const { address, isConnected } = useAccount();

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
      const res = await fetch(`${API_URL}/api/tips/${handle}`);
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
      const res = await fetch(`${API_URL}/api/tips/${handle}/history?limit=10`);
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
      <main className="min-h-screen bg-[#030014] flex items-center justify-center">
        {/* Animated Background */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-purple-600/20 rounded-full filter blur-[120px] animate-pulse-slow" />
          <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-indigo-600/15 rounded-full filter blur-[100px] animate-pulse-slow delay-1000" />
        </div>
        <div className="relative flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center animate-pulse">
            <Image src="/logo.png" alt="PayX" width={64} height={64} className="rounded-2xl" />
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
      <main className="min-h-screen bg-[#030014] flex flex-col items-center justify-center p-4">
        {/* Animated Background */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/3 left-1/3 w-[600px] h-[600px] bg-blue-600/15 rounded-full filter blur-[120px]" />
          <div className="absolute bottom-1/3 right-1/3 w-[500px] h-[500px] bg-indigo-600/10 rounded-full filter blur-[100px]" />
        </div>
        
        <div className="relative glass-premium rounded-3xl p-10 max-w-md text-center border border-white/5">
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
              href="/claim" 
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all duration-300 hover:-translate-y-0.5"
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
    <main className="min-h-screen bg-[#030014]">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[800px] h-[800px] bg-indigo-600/10 rounded-full filter blur-[150px] animate-pulse-slow" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-purple-600/10 rounded-full filter blur-[120px] animate-pulse-slow delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-cyan-600/5 rounded-full filter blur-[150px]" />
      </div>

      {/* Navigation */}
      <nav className="relative glass-premium border-b border-white/5 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="relative">
                <Image 
                  src="/logo.png" 
                  alt="PayX" 
                  width={40} 
                  height={40} 
                  className="rounded-xl shadow-lg shadow-indigo-500/25 group-hover:shadow-indigo-500/40 transition-all duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">PayX</span>
            </Link>
            <div className="flex items-center space-x-4">
              <Link 
                href="/claim" 
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
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-lg flex items-center justify-center border-2 border-[#030014]">
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
          
          {tipInfo?.isRegistered && (
            <div className="glass-premium rounded-2xl px-5 py-3 border border-white/5 flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-sm text-gray-400">Wallet Linked</span>
            </div>
          )}
        </div>

        {/* Hero Stats Card */}
        <div className="relative mb-8 rounded-3xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/90 via-purple-600/90 to-pink-600/90" />
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
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
              <span className="text-2xl text-white/60 font-medium">USDC</span>
            </div>
            
            {pendingAmount > 0 && (
              <Link
                href="/claim"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-gray-900 font-semibold hover:bg-gray-100 transition-all duration-300 shadow-lg"
              >
                <Zap className="w-5 h-5" />
                Claim Now
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-3 gap-5 mb-8">
          <div className="glass-premium rounded-2xl p-6 border border-white/5 group hover:border-indigo-500/30 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <span className="text-gray-400 text-sm font-medium">Total Received</span>
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center group-hover:bg-indigo-500/20 transition-colors">
                <TrendingUp className="w-5 h-5 text-indigo-400" />
              </div>
            </div>
            <p className="text-3xl font-bold text-white mb-1">${totalReceived.toFixed(2)}</p>
            <p className="text-sm text-gray-500">Lifetime earnings</p>
          </div>
          
          <div className="glass-premium rounded-2xl p-6 border border-white/5 group hover:border-green-500/30 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <span className="text-gray-400 text-sm font-medium">Total Claimed</span>
              <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center group-hover:bg-green-500/20 transition-colors">
                <Check className="w-5 h-5 text-green-400" />
              </div>
            </div>
            <p className="text-3xl font-bold text-white mb-1">${totalClaimed.toFixed(2)}</p>
            <p className="text-sm text-gray-500">Successfully withdrawn</p>
          </div>
          
          <div className="glass-premium rounded-2xl p-6 border border-white/5 group hover:border-pink-500/30 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <span className="text-gray-400 text-sm font-medium">Total Tips</span>
              <div className="w-10 h-10 rounded-xl bg-pink-500/10 flex items-center justify-center group-hover:bg-pink-500/20 transition-colors">
                <Users className="w-5 h-5 text-pink-400" />
              </div>
            </div>
            <p className="text-3xl font-bold text-white mb-1">{tipInfo?.tipCount || 0}</p>
            <p className="text-sm text-gray-500">From supporters</p>
          </div>
        </div>

        {/* Linked Wallet */}
        {tipInfo?.isRegistered && tipInfo.linkedWallet !== "0x0000000000000000000000000000000000000000" && (
          <div className="glass-premium rounded-2xl p-6 border border-white/5 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center">
                  <Wallet className="w-6 h-6 text-indigo-400" />
                </div>
                <div>
                  <h2 className="text-white font-semibold mb-1">Linked Wallet</h2>
                  <code className="text-gray-400 font-mono text-sm">
                    {tipInfo.linkedWallet}
                  </code>
                </div>
              </div>
              <a 
                href={`https://testnet.arcscan.app/address/${tipInfo.linkedWallet}`}
                target="_blank"
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all text-sm font-medium"
              >
                View on ArcScan
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        )}

        {/* Recent Tips */}
        <div className="glass-premium rounded-2xl border border-white/5 overflow-hidden">
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
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                      <DollarSign className="w-6 h-6 text-white" />
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
