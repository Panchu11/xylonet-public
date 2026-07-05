"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight, Zap, Shield, Globe, Code,
  Activity, ExternalLink, Copy, CheckCircle,
  DollarSign, Bot, LayoutDashboard
} from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_FACILITATOR_API || 'http://localhost:3001';
const ARC_SCAN = 'https://testnet.arcscan.app';
const FACILITATOR_CONTRACT = '0x7A97181936bA95e092E3e76223a0dab0Db97f17d';

interface FacilitatorStatus {
  feeBps: number;
  feePercent: number;
  treasury: string;
  totalSettled: number;
  totalTransactions: number;
}

const truncateAddress = (addr: string) =>
  addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : '';

export default function XyloFacilitatorPage() {
  const [facilitatorStatus, setFacilitatorStatus] = useState<FacilitatorStatus | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch(`${API_BASE}/v1/facilitator/status`);
        if (res.ok) {
          const data = await res.json();
          setFacilitatorStatus(data);
        }
      } catch {}
    };
    fetchStatus();
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <main className="min-h-screen bg-[#0f172a] relative">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute w-[800px] h-[800px] -top-64 -right-64 rounded-full bg-[#01C38E] opacity-[0.03] blur-[120px]" />
        <div className="absolute w-[600px] h-[600px] top-1/2 -left-48 rounded-full bg-[#0A786A] opacity-[0.05] blur-[100px]" />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0f172a]/80 backdrop-blur-xl border-b border-[#334155]/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center gap-2">
                <Image src="/branding/xylonet-symbol.svg" alt="XyloNet" width={28} height={28} />
                <span className="text-sm font-semibold text-[#64748b] tracking-wider uppercase">XyloNet</span>
              </Link>
              <div className="w-px h-6 bg-[#334155]" />
              <span className="text-lg font-bold bg-gradient-to-r from-[#132D46] via-[#0A786A] to-[#01C38E] bg-clip-text text-transparent">
                XyloFacilitator
              </span>
            </div>

            <div className="flex items-center gap-3">
              <a
                href={`${ARC_SCAN}/address/${FACILITATOR_CONTRACT}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg text-[#94a3b8] text-sm hover:text-[#01C38E] transition-colors"
              >
                <ExternalLink size={14} />
                ArcScan
              </a>
              <Link
                href="/xylofacilitator/dashboard"
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#01C38E] text-[#0f172a] text-sm font-semibold hover:bg-[#01C38E]/90 transition-all"
              >
                <LayoutDashboard size={14} />
                Developer Portal
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="relative z-10 pt-24 md:pt-20">
        {/* Hero */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#01C38E]/10 border border-[#01C38E]/20 text-[#01C38E] text-sm font-medium mb-6">
              <Zap size={14} />
              First hosted x402 facilitator on Arc
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6">
              <span className="bg-gradient-to-r from-[#132D46] via-[#0A786A] to-[#01C38E] bg-clip-text text-transparent">
                XyloFacilitator
              </span>
            </h1>
            <p className="text-xl text-[#94a3b8] max-w-3xl mx-auto leading-relaxed mb-8">
              The first hosted x402 facilitator-as-a-service on Arc.
              Any developer registers, sets their API prices in USDC,
              and AI agents start paying immediately.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link
                href="/xylofacilitator/dashboard"
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#132D46] via-[#0A786A] to-[#01C38E] text-white font-bold text-lg hover:shadow-[0_0_30px_rgba(1,195,142,0.3)] transition-all"
              >
                Launch Portal
                <ArrowRight size={18} />
              </Link>
              <a
                href="#how-it-works"
                className="flex items-center gap-2 px-6 py-3 rounded-xl border border-[#334155] text-[#94a3b8] font-medium hover:text-white hover:border-[#64748b] transition-all"
              >
                Learn More
              </a>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-20">
            {[
              {
                label: 'Network',
                value: 'Arc',
                sub: '< 1s finality',
                icon: Globe,
                color: '#01C38E'
              },
              {
                label: 'Total Settled',
                value: facilitatorStatus
                  ? `${(facilitatorStatus.totalSettled / 1e6).toFixed(2)}`
                  : '---',
                sub: 'USDC',
                icon: DollarSign,
                color: '#01C38E'
              },
              {
                label: 'Transactions',
                value: facilitatorStatus
                  ? facilitatorStatus.totalTransactions.toString()
                  : '---',
                sub: 'on-chain',
                icon: Activity,
                color: '#01C38E'
              },
              {
                label: 'Fee',
                value: '1%',
                sub: `${facilitatorStatus?.feeBps || 100} bps`,
                icon: Shield,
                color: '#0A786A'
              },
            ].map((stat, i) => (
              <div
                key={i}
                className="bg-[#1e293b]/60 backdrop-blur-sm border border-[#334155]/50 rounded-xl p-6 hover:border-[#01C38E]/20 transition-all"
              >
                <stat.icon size={20} style={{ color: stat.color }} className="mb-3" />
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-xs text-[#64748b] mt-1">{stat.sub}</div>
                <div className="text-xs text-[#94a3b8] font-medium">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* How It Works */}
          <div id="how-it-works" className="bg-[#1e293b]/40 backdrop-blur-sm border border-[#334155]/50 rounded-2xl p-8 mb-16">
            <h2 className="text-2xl font-bold text-white mb-8 text-center">How It Works</h2>
            <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-6">
              {[
                { icon: Bot, label: 'AI Agent', desc: 'Sends HTTP request with EIP-3009 signed payment', color: '#01C38E' },
                { icon: ArrowRight, label: '', desc: '', color: '#334155' },
                { icon: Shield, label: 'XyloFacilitator', desc: 'Verifies signature, settles USDC on Arc in <1s', color: '#01C38E' },
                { icon: ArrowRight, label: '', desc: '', color: '#334155' },
                { icon: Code, label: 'Developer API', desc: 'Receives payment, serves response', color: '#6BCCFF' },
              ].map((step, i) =>
                step.label ? (
                  <div key={i} className="flex flex-col items-center text-center max-w-[200px]">
                    <div className="w-16 h-16 rounded-xl flex items-center justify-center mb-3"
                      style={{ background: `${step.color}15`, border: `1px solid ${step.color}30` }}>
                      <step.icon size={28} style={{ color: step.color }} />
                    </div>
                    <div className="font-bold text-white text-sm">{step.label}</div>
                    <div className="text-xs text-[#64748b] mt-1">{step.desc}</div>
                  </div>
                ) : (
                  <step.icon key={i} size={24} style={{ color: step.color }} className="hidden md:block flex-shrink-0" />
                )
              )}
            </div>
          </div>

          {/* Developer Quick Start */}
          <div className="bg-[#1e293b]/60 border border-[#334155]/50 rounded-2xl overflow-hidden mb-16">
            <div className="px-6 py-4 border-b border-[#334155]/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Code size={16} className="text-[#01C38E]" />
                <span className="text-sm font-semibold text-white">Quick Start</span>
              </div>
              <Link
                href="/xylofacilitator/docs"
                className="text-xs text-[#01C38E] hover:underline"
              >
                Full docs &rarr;
              </Link>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <div className="text-xs text-[#01C38E] font-mono mb-2">1. Sign in with your wallet</div>
                <p className="text-sm text-[#94a3b8]">
                  Connect your wallet on the Developer Portal and sign a SIWE message. Your account is created automatically.
                </p>
              </div>
              <div>
                <div className="text-xs text-[#01C38E] font-mono mb-2">2. Create a priced API route</div>
                <pre className="bg-[#0f172a] rounded-xl p-4 text-sm font-mono text-[#94a3b8] overflow-x-auto">
{`POST ${API_BASE}/v1/developer/routes
{
  "routePath": "weather",
  "targetUrl": "https://api.weather.com/v1/current",
  "priceUsd": 0.01,
  "description": "Get current weather data"
}`}
                </pre>
              </div>
              <div>
                <div className="text-xs text-[#01C38E] font-mono mb-2">3. AI agents pay automatically via x402</div>
                <pre className="bg-[#0f172a] rounded-xl p-4 text-sm font-mono text-[#94a3b8] overflow-x-auto">
{`# Agent requests your route:
GET ${API_BASE}/v1/proxy/weather?city=NYC
→ 402 Payment Required (includes price + payment address)

# Agent retries with payment header:
GET ${API_BASE}/v1/proxy/weather?city=NYC
X-Payment: x402 <base64-eip3009-auth>
→ 200 OK (payment settled, response returned)`}
                </pre>
              </div>
            </div>
          </div>

          {/* Contract Address */}
          <div className="bg-[#1e293b]/40 border border-[#334155]/50 rounded-xl p-6 mb-16">
            <div className="text-xs text-[#64748b] font-medium uppercase tracking-wider mb-3">Contract (Arc Testnet)</div>
            <div className="flex items-center gap-3">
              <code className="text-sm text-[#01C38E] font-mono flex-1">{FACILITATOR_CONTRACT}</code>
              <button
                onClick={() => handleCopy(FACILITATOR_CONTRACT, 'contract')}
                className="p-2 rounded-md hover:bg-[#334155]/50 transition-colors"
              >
                {copied === 'contract' ? (
                  <CheckCircle size={14} className="text-[#01C38E]" />
                ) : (
                  <Copy size={14} className="text-[#64748b]" />
                )}
              </button>
              <a
                href={`${ARC_SCAN}/address/${FACILITATOR_CONTRACT}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-md hover:bg-[#334155]/50 transition-colors"
              >
                <ExternalLink size={14} className="text-[#64748b]" />
              </a>
            </div>
            <div className="flex flex-wrap gap-4 mt-4 text-xs text-[#64748b]">
              <span>Network: Arc Testnet (5042002)</span>
              <span>USDC: Native (0x3600...0000)</span>
              <span>Fee: 1% (100 bps)</span>
              <span>Settlement: Sub-second</span>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center pb-16">
            <Link
              href="/xylofacilitator/dashboard"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-[#132D46] via-[#0A786A] to-[#01C38E] text-white font-bold text-lg hover:shadow-[0_0_30px_rgba(1,195,142,0.3)] transition-all"
            >
              <LayoutDashboard size={20} />
              Open Developer Portal
              <ArrowRight size={18} />
            </Link>
            <p className="text-sm text-[#64748b] mt-4">
              Free to start. No SDK required on the AI agent side.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
