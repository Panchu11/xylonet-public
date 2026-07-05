'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Sparkles, Zap, Users, TrendingUp, Chrome, ArrowRight, Gift, Clock, Loader2 } from 'lucide-react';
import { usePayXStats, formatVolume, formatNumber } from '@/hooks/usePayXStats';

// X Icon
const XIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

// Animated counter - re-animates when value changes
function AnimatedNumber({ value, suffix = '', prefix = '', duration = 1500 }: { value: number; suffix?: string; prefix?: string; duration?: number }) {
  const [displayValue, setDisplayValue] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const animatingRef = useRef(false);

  useEffect(() => {
    // Prevent multiple animations running simultaneously
    if (animatingRef.current) return;
    animatingRef.current = true;
    
    const startValue = displayValue;
    const startTime = performance.now();
    
    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 4);
      const newValue = Math.floor(startValue + (value - startValue) * easeOut);
      setDisplayValue(newValue);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        animatingRef.current = false;
      }
    };
    
    requestAnimationFrame(animate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return <span ref={ref}>{prefix}{displayValue.toLocaleString()}{suffix}</span>;
}

export default function PayXShowcase() {
  const [isVisible, setIsVisible] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);
  const [isMounted, setIsMounted] = useState(false);
  
  // Prevent hydration mismatch - only render particles on client
  useEffect(() => {
    setIsMounted(true);
  }, []);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  // Auto-cycle features
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % 3);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      icon: <Gift className="w-6 h-6" />,
      title: 'Tip Anyone on X',
      description: 'Send USDC tips instantly to any creator on X/Twitter',
      gradient: 'from-[#0A786A] to-[#01C38E]'
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: 'No Wallet Needed',
      description: 'Recipients claim with just their X account - connect wallet later',
      gradient: 'from-[#01C38E] to-[#01C38E]'
    },
    {
      icon: <Chrome className="w-6 h-6" />,
      title: 'Chrome Extension',
      description: 'One-click tipping on every tweet - available now!',
      gradient: 'from-[#0A786A] to-[#01C38E]'
    }
  ];

  // Fetch real stats from API
  const { stats: apiStats, loading: statsLoading } = usePayXStats(30000); // Refresh every 30s

  // Dynamic stats from API (with fallback values)
  const stats = [
    { label: 'Tips Today', value: apiStats?.tips_24h || 0, icon: <Gift className="w-5 h-5" />, color: 'from-[#0A786A] to-[#01C38E]' },
    { label: 'Volume 24h', value: Math.round(apiStats?.volume_24h || 0), prefix: '$', icon: <Image src="/tokens/usdc.png" alt="USDC" width={20} height={20} className="rounded-full" />, color: 'from-[#0A786A] to-[#01C38E]' },
    { label: 'Total Tips', value: apiStats?.total_tips || 0, icon: <Gift className="w-5 h-5" />, color: 'from-[#132D46] to-[#0A786A]' },
    { label: 'Total Volume', value: Math.round(apiStats?.total_volume || 0), prefix: '$', icon: <Image src="/tokens/usdc.png" alt="USDC" width={20} height={20} className="rounded-full" />, color: 'from-[#132D46] to-[#0A786A]' },
  ];

  return (
    <section ref={sectionRef} className="relative py-32 px-4 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        {/* Primary gradient orb */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[1000px] bg-gradient-radial from-[#0A786A]/10 via-[#01C38E]/5 to-transparent rounded-full blur-3xl" />
        
        {/* Secondary gradient */}
        <div className="absolute bottom-0 right-0 w-[800px] h-[800px] bg-gradient-radial from-[#01C38E]/10 via-[#01C38E]/5 to-transparent rounded-full blur-3xl" />

        {/* Floating PNG Assets */}
        <div className="absolute left-[5%] top-[15%] w-24 h-24 md:w-40 md:h-40 opacity-15 animate-float-delayed hidden lg:block">
          <img 
            src="/branding/coin-main.png" 
            alt="" 
            className="w-full h-full object-contain drop-shadow-2xl"
          />
        </div>
        <div className="absolute right-[8%] bottom-[20%] w-20 h-20 md:w-32 md:h-32 opacity-12 animate-float-slow hidden md:block">
          <img 
            src="/branding/coin-alt.png" 
            alt="" 
            className="w-full h-full object-contain"
          />
        </div>

        {/* Animated particles - Client-only to prevent hydration mismatch */}
        {isMounted && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-white rounded-full animate-float-particle opacity-20"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 5}s`,
                  animationDuration: `${10 + Math.random() * 10}s`,
                }}
              />
            ))}
          </div>
        )}

        {/* Grid pattern */}
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                             linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '80px 80px',
          }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header with NEW badge */}
        <div 
          className={`text-center mb-16 transition-all duration-1000 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          {/* NEW Badge */}
          <div className="inline-flex items-center gap-3 bg-gradient-to-r from-[#0A786A]/10 via-[#01C38E]/10 to-[#01C38E]/10 border border-[#0A786A]/30 rounded-full px-6 py-3 mb-8 backdrop-blur-sm">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#01C38E] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-[#01C38E]"></span>
            </span>
            <span className="bg-gradient-to-r from-[#0A786A] via-[#01C38E] to-[#01C38E] text-transparent bg-clip-text font-bold text-sm tracking-wide">
              NEW: XyloNet's Flagship Feature
            </span>
            <span className="bg-[#0A786A]/20 text-[#01C38E] text-xs font-semibold px-2.5 py-1 rounded-full">
              LIVE
            </span>
          </div>

          {/* Main Heading */}
          <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 tracking-tight">
            Introducing{' '}
            <span className="relative inline-block">
              <span className="relative z-10 bg-gradient-to-r from-[#0A786A] via-[#01C38E] to-[#01C38E] text-transparent bg-clip-text">
                PayX
              </span>
              <span className="absolute -inset-2 bg-gradient-to-r from-[#0A786A]/20 via-[#01C38E]/20 to-[#01C38E]/20 blur-xl rounded-lg" />
            </span>
          </h2>

          <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
            The world's first <span className="text-white font-semibold">decentralized tipping protocol</span> for X/Twitter.
            Send USDC tips instantly — no wallet needed for recipients.
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-8 mb-16">
          {/* Left: Interactive Feature Demo */}
          <div 
            className={`transition-all duration-1000 delay-200 ${
              isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'
            }`}
          >
            <div className="relative group">
              {/* Glow effect */}
              <div className="absolute -inset-1 bg-gradient-to-r from-[#0A786A] via-[#01C38E] to-[#01C38E] rounded-3xl blur-2xl opacity-20 group-hover:opacity-30 transition-opacity" />
              
              <div className="relative bg-gradient-to-br from-gray-900/90 to-gray-900/50 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-10">
                {/* Mock PayX Interface */}
                <div className="space-y-6">
                  {/* Header */}
                  <div className="flex items-center gap-4 mb-8">
                    <div className="relative">
                      <Image 
                        src="/branding/payx/payx-icon-gradient.svg" 
                        alt="PayX" 
                        width={56} 
                        height={56} 
                      />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white">PayX</h3>
                      <p className="text-gray-400 text-sm">Powered by Arc Network</p>
                    </div>
                  </div>

                  {/* Features Carousel */}
                  <div className="relative h-[280px] overflow-hidden rounded-2xl bg-black/30 p-6">
                    {features.map((feature, index) => (
                      <div
                        key={index}
                        className={`absolute inset-0 p-6 transition-all duration-700 ${
                          activeFeature === index
                            ? 'opacity-100 translate-y-0'
                            : 'opacity-0 translate-y-8 pointer-events-none'
                        }`}
                      >
                        <div className={`inline-flex w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} items-center justify-center mb-6 shadow-lg`}>
                          {feature.icon}
                        </div>
                        <h4 className="text-2xl font-bold text-white mb-3">{feature.title}</h4>
                        <p className="text-gray-400 text-lg leading-relaxed">{feature.description}</p>
                      </div>
                    ))}

                    {/* Progress indicators */}
                    <div className="absolute bottom-6 left-6 right-6 flex gap-2">
                      {features.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setActiveFeature(index)}
                          className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden"
                        >
                          <div 
                            className={`h-full bg-gradient-to-r from-[#0A786A] to-[#01C38E] transition-all duration-300 ${
                              activeFeature === index ? 'w-full' : 'w-0'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* CTA */}
                  <Link 
                    href="/payx" 
                    className="group flex items-center justify-center gap-3 w-full px-6 py-4 bg-gradient-to-r from-[#0A786A] via-[#01C38E] to-[#01C38E] hover:from-[#0A786A] hover:via-[#01C38E] hover:to-[#01C38E] text-white font-bold rounded-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-[#01C38E]/50"
                  >
                    <Sparkles className="w-5 h-5" />
                    <span>Explore PayX</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Stats & Chrome Extension */}
          <div 
            className={`space-y-6 transition-all duration-1000 delay-400 ${
              isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'
            }`}
          >
            {/* Live Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              {stats.map((stat, index) => (
                <div 
                  key={stat.label}
                  className="group relative"
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  <div className={`absolute -inset-0.5 bg-gradient-to-br ${stat.color} rounded-2xl blur opacity-0 group-hover:opacity-30 transition-opacity`} />
                  <div className="relative bg-gradient-to-br from-gray-900/90 to-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all">
                    <div className={`inline-flex w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} items-center justify-center mb-3`}>
                      {stat.icon}
                    </div>
                    <div className="text-3xl font-bold text-white mb-1">
                      <AnimatedNumber value={stat.value} prefix={stat.prefix} />
                    </div>
                    <div className="text-sm text-gray-400">{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Chrome Extension Card */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-[#132D46] via-[#0A786A] to-[#01C38E] rounded-2xl blur opacity-20 group-hover:opacity-40 transition-opacity" />
              <div className="relative bg-gradient-to-br from-gray-900/90 to-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-8 hover:border-white/20 transition-all">
                {/* Chrome Logo */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#132D46] via-[#0A786A] to-[#01C38E] flex items-center justify-center shadow-xl">
                    <Chrome className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">Chrome Extension</h3>
                    <p className="text-sm text-[#01C38E]">Available on Chrome Web Store</p>
                  </div>
                </div>

                <p className="text-gray-300 mb-6 leading-relaxed">
                  Tip creators with a single click on every tweet. Install the extension and start spreading love.
                </p>

                {/* Install Button */}
                <a 
                  href="https://chromewebstore.google.com/detail/lfnlmagjbpmgjbekebhgnjklpjhnjigi"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-[#0A786A] to-[#01C38E] hover:from-[#0A786A] hover:to-[#01C38E] rounded-xl text-white font-semibold transition-all hover:scale-105 shadow-lg shadow-[#01C38E]/30"
                >
                  <Chrome className="w-5 h-5" />
                  <span>Install Extension</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div className="grid grid-cols-2 gap-4">
              <Link 
                href="/payx/claim" 
                className="group relative bg-gradient-to-br from-gray-900/90 to-gray-900/50 backdrop-blur-xl border border-white/10 hover:border-[#0A786A]/50 rounded-2xl p-6 transition-all hover:scale-[1.02]"
              >
                <Gift className="w-8 h-8 text-[#0A786A] mb-3" />
                <div className="text-lg font-bold text-white mb-1">Claim Tips</div>
                <div className="text-sm text-gray-400">Connect & withdraw</div>
                <ArrowRight className="absolute top-6 right-6 w-5 h-5 text-gray-600 group-hover:text-[#0A786A] group-hover:translate-x-1 transition-all" />
              </Link>

              <Link 
                href="/payx/dashboard" 
                className="group relative bg-gradient-to-br from-gray-900/90 to-gray-900/50 backdrop-blur-xl border border-white/10 hover:border-[#01C38E]/50 rounded-2xl p-6 transition-all hover:scale-[1.02]"
              >
                <TrendingUp className="w-8 h-8 text-[#01C38E] mb-3" />
                <div className="text-lg font-bold text-white mb-1">Dashboard</div>
                <div className="text-sm text-gray-400">View your stats</div>
                <ArrowRight className="absolute top-6 right-6 w-5 h-5 text-gray-600 group-hover:text-[#01C38E] group-hover:translate-x-1 transition-all" />
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom: Powered by X */}
        <div 
          className={`text-center transition-all duration-1000 delay-600 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <div className="inline-flex items-center gap-4 px-8 py-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl">
            <span className="text-gray-400">Built for</span>
            <XIcon className="w-6 h-6 text-white" />
            <span className="text-gray-400">×</span>
            <Image src="/chains/arc.png" alt="Arc" width={24} height={24} className="rounded" />
            <span className="text-gray-400">×</span>
            <span className="font-bold text-white">Circle USDC</span>
          </div>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0f172a] to-transparent" />
    </section>
  );
}
