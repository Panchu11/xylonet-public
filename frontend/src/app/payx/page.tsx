"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Zap, Shield, Globe, Sparkles, Users, TrendingUp, ChevronRight, Star, Chrome, Download, Check, Play, Twitter, Loader2 } from "lucide-react";
import { usePayXStats, useRecentTips, formatVolume, formatNumber, getAvatarGradient } from "@/hooks/usePayXStats";

// X Icon Component
const XIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

export default function PayXHome() {
  const [isExtensionInstalled, setIsExtensionInstalled] = useState(false);
  const [showVideo, setShowVideo] = useState(false);

  // Fetch real data from API
  const { stats, loading: statsLoading } = usePayXStats(30000); // Refresh every 30s
  const { tips: recentTips, loading: tipsLoading } = useRecentTips(6, 15000); // Get 6 tips, refresh every 15s

  // Check if Chrome extension is installed
  useEffect(() => {
    // Extension detection would check for specific DOM elements or messages
    // For now, simulate detection
    const checkExtension = () => {
      // In production: check if extension ID exists
      // chrome.runtime.sendMessage(EXTENSION_ID, ...)
      setIsExtensionInstalled(false);
    };
    checkExtension();
  }, []);

  return (
    <main className="min-h-screen bg-[#0f172a] relative">
      {/* Animated Background Orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="payx-orb payx-orb-primary w-[600px] h-[600px] -top-48 -right-48 payx-animate-float" />
        <div className="payx-orb payx-orb-secondary w-[500px] h-[500px] top-1/2 -left-48 payx-animate-float" style={{ animationDelay: '2s' }} />
        <div className="payx-orb payx-orb-accent w-[400px] h-[400px] bottom-0 right-1/4 payx-animate-float" style={{ animationDelay: '4s' }} />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 payx-glass-strong" style={{ isolation: 'isolate' }}>
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
              <span className="text-2xl font-bold tracking-tight text-white">PayX</span>
            </Link>
            <div className="hidden md:flex items-center space-x-8 flex-shrink-0 relative z-10">
              <a href="#features" className="payx-btn-ghost">Features</a>
              <a href="#how-it-works" className="payx-btn-ghost">How it Works</a>
              <Link href="/payx/dashboard" className="payx-btn-ghost">Dashboard</Link>
            </div>
            <div className="flex items-center space-x-4 flex-shrink-0 relative z-30">
              <Link href="/payx/claim" className="payx-btn-secondary hidden sm:flex items-center space-x-2">
                <Sparkles className="w-4 h-4" />
                <span>Claim Tips</span>
              </Link>
              <Link href="/payx/claim" className="payx-btn-primary flex items-center space-x-2">
                <span>Get Started</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-32 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center space-x-2 payx-glass rounded-full px-5 py-2.5 mb-8 payx-animate-fade-in-up">
              <Image src="/chains/arc.png" alt="Arc" width={18} height={18} className="rounded-full" />
              <span className="text-sm font-medium text-gray-300">Live on Arc Network</span>
              <span className="text-xs px-2 py-0.5 bg-[#0A786A]/20 text-[#01C38E] rounded-full">Testnet</span>
            </div>
            
            {/* Main Heading */}
            <h1 className="text-6xl md:text-8xl font-bold mb-8 tracking-tight payx-animate-fade-in-up text-white">
              <span className="bg-gradient-to-r from-[#132D46] via-[#0A786A] to-[#01C38E] bg-clip-text text-transparent">Tip Anyone on</span>
              <br />
              <svg 
                viewBox="0 0 24 24" 
                className="w-[1em] h-[1em] inline-block mt-2" 
                style={{ fill: 'url(#xGradient)' }}
              >
                <defs>
                  <linearGradient id="xGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#132D46" />
                    <stop offset="50%" stopColor="#0A786A" />
                    <stop offset="100%" stopColor="#01C38E" />
                  </linearGradient>
                </defs>
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </h1>
            
            {/* Subheading */}
            <p className="text-xl md:text-2xl text-gray-400 max-w-2xl mx-auto mb-12 leading-relaxed payx-animate-fade-in-up">
              Send <span className="text-white font-semibold">USDC tips</span> instantly to any creator.
              No wallet needed to receive — just sign in with X to claim.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8 payx-animate-fade-in-up">
              <Link href="/payx/claim" className="payx-btn-primary text-lg px-8 py-4 flex items-center space-x-3 group">
                <Sparkles className="w-5 h-5" />
                <span>Claim Your Tips</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a 
                href="#how-it-works" 
                className="payx-btn-secondary text-lg px-8 py-4 flex items-center space-x-2"
              >
                <span>See How It Works</span>
              </a>
            </div>

            {/* Install Extension CTA */}
            <div className="mb-16 payx-animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <a
                href="https://chromewebstore.google.com/detail/lfnlmagjbpmgjbekebhgnjklpjhnjigi"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-[#132D46]/20 via-[#0A786A]/20 to-[#01C38E]/20 hover:from-[#132D46]/30 hover:via-[#0A786A]/30 hover:to-[#01C38E]/30 border border-[#0A786A]/30 hover:border-[#01C38E]/50 rounded-full transition-all group"
              >
                <Chrome className="w-5 h-5 text-[#01C38E]" />
                <span className="text-white font-medium">Install Chrome Extension</span>
                <span className="flex items-center gap-1.5 text-xs bg-[#01C38E]/20 text-[#01C38E] px-2.5 py-1 rounded-full">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#01C38E] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#01C38E]"></span>
                  </span>
                  Live
                </span>
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-white group-hover:translate-x-1 transition-all" />
              </a>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-8 max-w-lg mx-auto payx-animate-fade-in-up">
              <div className="text-center">
                <p className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-[#0A786A] to-[#01C38E] bg-clip-text text-transparent">$0.01</p>
                <p className="text-gray-500 text-sm mt-1">Per Transaction</p>
              </div>
              <div className="text-center border-x border-white/10">
                <p className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-[#0A786A] to-[#01C38E] bg-clip-text text-transparent">&lt;1s</p>
                <p className="text-gray-500 text-sm mt-1">Finality</p>
              </div>
              <div className="text-center">
                <p className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-[#01C38E] to-[#0A786A] bg-clip-text text-transparent">1%</p>
                <p className="text-gray-500 text-sm mt-1">Platform Fee</p>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-1/2 left-10 w-20 h-20 border border-white/5 rounded-2xl rotate-12 payx-animate-float" />
        <div className="absolute bottom-20 right-10 w-16 h-16 border border-white/5 rounded-xl -rotate-12 payx-animate-float" style={{ animationDelay: '1s' }} />
      </section>

      {/* Features Section */}
      <section id="features" className="relative py-32 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <span className="text-sm font-semibold text-[#01C38E] tracking-wider uppercase mb-4 block">Why PayX</span>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
              Built for <span className="bg-gradient-to-r from-[#0A786A] to-[#01C38E] bg-clip-text text-transparent">Creators</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              The easiest way to receive tips from your audience on X
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="payx-card group hover:border-[#01C38E]/30 transition-all duration-300 hover:-translate-y-1">
              <div className="relative w-14 h-14 mb-6">
                <div className="absolute inset-0 bg-gradient-to-br from-[#0A786A] to-[#01C38E] rounded-2xl opacity-20 group-hover:opacity-30 transition-opacity" />
                <div className="relative w-full h-full bg-gradient-to-br from-[#0A786A] to-[#01C38E] rounded-2xl flex items-center justify-center shadow-lg shadow-[#01C38E]/20">
                  <Zap className="w-7 h-7 text-white" />
                </div>
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">Instant Tips</h3>
              <p className="text-gray-400 leading-relaxed">
                Sub-second finality on Arc Network. Tips arrive in your account instantly, ready to claim anytime.
              </p>
            </div>
            
            {/* Feature 2 */}
            <div className="payx-card group hover:border-[#0A786A]/30 transition-all duration-300 hover:-translate-y-1">
              <div className="relative w-14 h-14 mb-6">
                <div className="absolute inset-0 bg-gradient-to-br from-[#132D46] to-[#0A786A] rounded-2xl opacity-20 group-hover:opacity-30 transition-opacity" />
                <div className="relative w-full h-full bg-gradient-to-br from-[#132D46] to-[#0A786A] rounded-2xl flex items-center justify-center shadow-lg shadow-[#0A786A]/20">
                  <Shield className="w-7 h-7 text-white" />
                </div>
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">No Wallet Needed</h3>
              <p className="text-gray-400 leading-relaxed">
                Recipients claim tips with just their X account. Connect a wallet only when you're ready to withdraw.
              </p>
            </div>
            
            {/* Feature 3 */}
            <div className="payx-card group hover:border-[#01C38E]/30 transition-all duration-300 hover:-translate-y-1">
              <div className="relative w-14 h-14 mb-6">
                <div className="absolute inset-0 bg-gradient-to-br from-[#0A786A] to-[#01C38E] rounded-2xl opacity-20 group-hover:opacity-30 transition-opacity" />
                <div className="relative w-full h-full bg-gradient-to-br from-[#0A786A] to-[#01C38E] rounded-2xl flex items-center justify-center shadow-lg shadow-[#01C38E]/20">
                  <Globe className="w-7 h-7 text-white" />
                </div>
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">Lowest Fees</h3>
              <p className="text-gray-400 leading-relaxed">
                Only ~$0.01 per transaction. Tip any amount without high gas fees eating into it.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="relative py-32 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <span className="text-sm font-semibold text-[#01C38E] tracking-wider uppercase mb-4 block">Simple Process</span>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
              How It <span className="bg-gradient-to-r from-[#0A786A] to-[#01C38E] bg-clip-text text-transparent">Works</span>
            </h2>
          </div>
          
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { step: "01", icon: Sparkles, title: "Install Extension", desc: "Add PayX to Chrome in one click", color: "from-[#132D46] to-[#0A786A]" },
              { step: "02", icon: Users, title: "Browse X", desc: "See tip buttons on every tweet", color: "from-[#0A786A] to-[#01C38E]" },
              { step: "03", icon: 'usdc', title: "Send Tip", desc: "Pick an amount and confirm", color: "from-[#01C38E] to-[#0A786A]" },
              { step: "04", icon: TrendingUp, title: "Creator Claims", desc: "Sign in with X to withdraw", color: "from-[#0A786A] to-[#132D46]" },
            ].map((item, index) => (
              <div key={item.step} className="relative group">
                <div className="payx-card text-center py-10 hover:border-[#01C38E]/30 transition-all duration-300">
                  <span className={`text-5xl font-bold bg-gradient-to-r ${item.color} bg-clip-text text-transparent opacity-20 absolute top-4 left-6`}>
                    {item.step}
                  </span>
                  <div className={`w-16 h-16 bg-gradient-to-br ${item.color} rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform`}>
                    {item.icon === 'usdc' ? (
                      <Image src="/tokens/usdc.png" alt="USDC" width={36} height={36} className="rounded-full" />
                    ) : (
                      <item.icon className="w-8 h-8 text-white" />
                    )}
                  </div>
                  <h3 className="text-lg font-bold mb-2 text-white">{item.title}</h3>
                  <p className="text-gray-400 text-sm">{item.desc}</p>
                </div>
                {index < 3 && (
                  <ChevronRight className="hidden md:block absolute top-1/2 -right-5 w-6 h-6 text-gray-600 -translate-y-1/2" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Chrome Extension Showcase */}
      <section className="relative py-32 px-4 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-[#132D46]/10 via-[#0A786A]/10 to-[#01C38E]/10 border border-[#0A786A]/30 rounded-full px-5 py-2.5 mb-6">
              <Chrome className="w-4 h-4 text-[#01C38E]" />
              <span className="text-[#01C38E] font-semibold text-sm">Available Now</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
              Tip with <span className="bg-gradient-to-r from-[#0A786A] via-[#01C38E] to-[#01C38E] bg-clip-text text-transparent">One Click</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Install our Chrome extension and tip creators directly from any tweet
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Extension Preview */}
            <div className="relative group">
              <div className="absolute -inset-4 bg-gradient-to-r from-[#132D46] via-[#0A786A] to-[#01C38E] rounded-3xl blur-2xl opacity-20 group-hover:opacity-30 transition-opacity" />
              <div className="relative bg-gradient-to-br from-gray-900/90 to-gray-900/50 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
                {/* Mock Extension UI */}
                <div className="space-y-6">
                  {/* Browser Bar */}
                  <div className="flex items-center gap-3 pb-4 border-b border-white/10">
                    <div className="flex gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500" />
                      <div className="w-3 h-3 rounded-full bg-yellow-500" />
                      <div className="w-3 h-3 rounded-full bg-[#01C38E]" />
                    </div>
                    <div className="flex-1 bg-black/30 rounded-lg px-4 py-2 text-sm text-gray-400 flex items-center gap-2">
                      <Globe className="w-4 h-4" />
                      <span>x.com/elonmusk</span>
                    </div>
                  </div>

                  {/* Tweet Preview */}
                  <div className="bg-black/30 rounded-2xl p-6 space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#0A786A] to-[#01C38E]" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-bold text-white">Elon Musk</span>
                          <Check className="w-4 h-4 text-blue-400" />
                          <span className="text-gray-500">@elonmusk</span>
                        </div>
                        <p className="text-gray-300 mb-4">This is an amazing tweet that deserves a tip! 🚀</p>
                        
                        {/* PayX Tip Button */}
                        <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#132D46] via-[#0A786A] to-[#01C38E] rounded-xl shadow-lg shadow-[#01C38E]/50 cursor-pointer hover:scale-105 transition-transform">
                          <Image src="/tokens/usdc.png" alt="USDC" width={20} height={20} className="rounded-full" />
                          <span className="text-white font-semibold">Tip with PayX</span>
                          <Sparkles className="w-5 h-5 text-white" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Features List */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <div className="w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center">
                        <Zap className="w-3 h-3" />
                      </div>
                      <span>Instant</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <div className="w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center">
                        <Shield className="w-3 h-3" />
                      </div>
                      <span>Secure</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <div className="w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center p-0.5">
                        <Image src="/tokens/usdc.png" alt="USDC" width={16} height={16} className="rounded-full" />
                      </div>
                      <span>USDC</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <div className="w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center">
                        <Check className="w-3 h-3" />
                      </div>
                      <span>Simple</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Download CTA */}
            <div className="space-y-8">
              {/* Status Badge */}
              <div className="inline-flex items-center gap-3 bg-[#0A786A]/10 border border-[#0A786A]/30 rounded-2xl px-6 py-4">
                <div className="w-12 h-12 rounded-xl bg-[#0A786A]/20 flex items-center justify-center">
                  <Chrome className="w-6 h-6 text-[#01C38E]" />
                </div>
                <div>
                  <div className="font-bold text-white mb-1">Available Now</div>
                  <div className="text-sm text-[#01C38E]">Live on Chrome Web Store</div>
                </div>
              </div>

              {/* Features */}
              <div className="space-y-4">
                {[
                  { icon: Chrome, title: 'One-Click Install', desc: 'Add to Chrome in seconds' },
                  { icon: Zap, title: 'Lightning Fast', desc: 'Instant USDC tips' },
                  { icon: Shield, title: 'Secure & Private', desc: 'Your keys, your control' },
                ].map((feature, i) => {
                  const Icon = feature.icon;
                  return (
                    <div key={i} className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/10 transition-all">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0A786A] to-[#01C38E] flex items-center justify-center flex-shrink-0">
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-white mb-1">{feature.title}</h3>
                        <p className="text-sm text-gray-400">{feature.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* CTA Button */}
              <a 
                href="https://chromewebstore.google.com/detail/lfnlmagjbpmgjbekebhgnjklpjhnjigi"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-3 px-8 py-5 bg-gradient-to-r from-[#0A786A] to-[#01C38E] hover:from-[#0A786A] hover:to-[#01C38E] rounded-2xl font-bold text-white text-lg transition-all hover:scale-[1.02] shadow-2xl shadow-[#01C38E]/30"
              >
                <Download className="w-6 h-6" />
                <span>Install from Chrome Web Store</span>
              </a>


            </div>
          </div>
        </div>
      </section>

      {/* Live Activity Feed */}
      <section className="relative py-32 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-[#0A786A]/10 border border-[#0A786A]/30 rounded-full px-5 py-2.5 mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#01C38E] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#01C38E]"></span>
              </span>
              <span className="text-[#01C38E] font-semibold text-sm">Live Activity</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
              Tips Happening <span className="bg-gradient-to-r from-[#0A786A] to-[#01C38E] bg-clip-text text-transparent">Right Now</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Join thousands of creators receiving tips every day
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {tipsLoading ? (
              // Loading skeleton
              [...Array(6)].map((_, i) => (
                <div 
                  key={i}
                  className="payx-card animate-pulse"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-white/10" />
                    <div className="flex-1">
                      <div className="h-4 bg-white/10 rounded w-20 mb-2" />
                      <div className="h-3 bg-white/10 rounded w-32" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="h-6 bg-white/10 rounded w-16" />
                    <div className="h-4 bg-white/10 rounded w-12" />
                  </div>
                </div>
              ))
            ) : recentTips.length > 0 ? (
              // Real tips from API
              recentTips.map((tip, i) => (
                <div 
                  key={tip.id}
                  className="payx-card hover:border-[#0A786A]/30 transition-all duration-300 hover:-translate-y-1 payx-animate-fade-in-up"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getAvatarGradient(tip.from)} flex items-center justify-center text-white font-bold text-sm`}>
                      {tip.from.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-white truncate">{tip.from}</div>
                      <div className="text-sm text-gray-400 truncate">tipped {tip.to}</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-2xl font-bold text-[#01C38E]">
                      <Image src="/tokens/usdc.png" alt="USDC" width={24} height={24} className="rounded-full" />
                      {tip.amount}
                    </div>
                    <div className="text-xs text-gray-500">
                      {tip.timeAgo}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              // Empty state - no tips yet
              <div className="col-span-3 text-center py-12">
                <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-8 h-8 text-gray-600" />
                </div>
                <p className="text-gray-400">No tips yet. Be the first to tip!</p>
              </div>
            )}
          </div>

          {/* Stats Summary */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {[
              { label: 'Tips Today', value: statsLoading ? '-' : formatNumber(stats?.tips_24h || 0), icon: Sparkles, color: 'from-[#132D46] to-[#0A786A]' },
              { label: 'Volume 24h', value: statsLoading ? '-' : formatVolume(stats?.volume_24h || 0), icon: TrendingUp, color: 'from-[#0A786A] to-[#01C38E]' },
              { label: 'Total Tips', value: statsLoading ? '-' : formatNumber(stats?.total_tips || 0), icon: Sparkles, color: 'from-[#01C38E] to-[#0A786A]' },
              { label: 'Total Volume', value: statsLoading ? '-' : formatVolume(stats?.total_volume || 0), icon: 'usdc', color: 'from-[#0A786A] to-[#01C38E]' },
              { label: 'Active Users', value: statsLoading ? '-' : formatNumber(stats?.total_users || 0), icon: Users, color: 'from-[#0A786A] to-[#132D46]' },
              { label: 'Avg Tip', value: statsLoading ? '-' : `$${(stats?.avg_tip || 0).toFixed(2)}`, icon: 'usdc', color: 'from-[#132D46] to-[#0A786A]' },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className={`inline-flex w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} items-center justify-center mb-3`}>
                  {stat.icon === 'usdc' ? (
                    <Image src="/tokens/usdc.png" alt="USDC" width={28} height={28} className="rounded-full" />
                  ) : (
                    <stat.icon className="w-6 h-6 text-white" />
                  )}
                </div>
                <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-sm text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-32 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="relative payx-card overflow-visible">
            {/* Glow effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-[#132D46] via-[#0A786A] to-[#01C38E] rounded-3xl opacity-20 blur-xl" />
            
            <div className="relative bg-gradient-to-br from-[#132D46]/10 via-[#0A786A]/10 to-[#01C38E]/10 rounded-2xl p-12 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#0A786A] to-[#01C38E] rounded-2xl mb-8 shadow-lg shadow-[#01C38E]/30">
                <Star className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-4xl font-bold mb-4 text-white">
                Start Receiving Tips <span className="bg-gradient-to-r from-[#0A786A] to-[#01C38E] bg-clip-text text-transparent">Today</span>
              </h2>
              <p className="text-xl text-gray-400 mb-10 max-w-lg mx-auto">
                Check if you have pending tips from your fans and followers
              </p>
              <Link href="/payx/claim" className="payx-btn-primary text-lg px-10 py-4 inline-flex items-center space-x-3">
                <span>Check My Tips</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative py-16 px-4 border-t border-white/10 bg-gradient-to-b from-transparent to-[#132D46]/20">
        <div className="max-w-7xl mx-auto">
          {/* Main Footer Content */}
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            {/* Brand */}
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <Image src="/branding/payx/payx-icon-gradient.svg" alt="PayX" width={40} height={40} />
                <span className="font-bold text-xl text-white">PayX</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                The easiest way to tip creators on X with USDC. Built on Arc Network.
              </p>
            </div>
            
            {/* Documentation */}
            <div>
              <h4 className="text-white font-semibold mb-4">Documentation</h4>
              <div className="space-y-3">
                <Link href="/payx/docs" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                  <svg className="w-4 h-4 text-[#01C38E]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  <span>Introduction</span>
                </Link>
                <Link href="/payx/docs/quickstart" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                  <svg className="w-4 h-4 text-[#0A786A]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span>Quick Start</span>
                </Link>
                <Link href="/payx/docs/contracts" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                  <svg className="w-4 h-4 text-[#01C38E]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>Smart Contract</span>
                </Link>
                <Link href="/payx/docs/faq" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                  <svg className="w-4 h-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>FAQ</span>
                </Link>
              </div>
            </div>
            
            {/* Network */}
            <div>
              <h4 className="text-white font-semibold mb-4">Network</h4>
              <div className="space-y-3">
                <a href="https://arc.network" target="_blank" rel="noopener" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                  <Image src="/chains/arc.png" alt="Arc" width={16} height={16} className="rounded-full" />
                  <span>Arc Network</span>
                </a>
                <a href="https://testnet.arcscan.app/address/0xA312c384770B7b49E371DF4b7AF730EFEF465913" target="_blank" rel="noopener" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                  <svg className="w-4 h-4 text-[#01C38E]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <span>Verified Contract</span>
                </a>
                <a href="https://faucet.circle.com" target="_blank" rel="noopener" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                  <Image src="/tokens/usdc.svg" alt="USDC" width={16} height={16} />
                  <span>Get Testnet USDC</span>
                </a>
              </div>
            </div>
            
            {/* Navigation */}
            <div>
              <h4 className="text-white font-semibold mb-4">Navigation</h4>
              <div className="space-y-3">
                <Link href="/payx/claim" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                  <Sparkles className="w-4 h-4 text-yellow-400" />
                  <span>Claim Tips</span>
                </Link>
                <Link href="/payx/dashboard" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                  <TrendingUp className="w-4 h-4 text-blue-400" />
                  <span>Dashboard</span>
                </Link>
                <Link href="/" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                  <span>Back to XyloNet</span>
                </Link>
              </div>
            </div>
          </div>
          
          {/* Bottom Bar */}
          <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-gray-500 text-sm">
              © 2026 PayX by ForgeLabs. Built for the creator economy.
            </div>
            <div className="flex items-center gap-3">
              <span className="text-gray-600 text-sm">Built by</span>
              <span className="font-semibold bg-gradient-to-r from-[#0A786A] to-[#01C38E] bg-clip-text text-transparent">ForgeLabs</span>
              <span className="text-gray-700">•</span>
              <span className="text-gray-600 text-sm">Powered by</span>
              <Image src="/chains/arc.png" alt="Arc" width={16} height={16} className="rounded-full" />
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
