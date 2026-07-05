'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useReadContracts } from 'wagmi';
import { CONTRACTS } from '@/config/constants';
import { XYLO_POOL_ABI, XYLO_VAULT_ABI } from '@/config/abis';
import { formatUnits } from 'viem';

// Animated number counter with formatting
function AnimatedCounter({ value, suffix = '', prefix = '' }: { value: number; suffix?: string; prefix?: string }) {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          const duration = 2000;
          const startTime = performance.now();
          
          const animate = (currentTime: number) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeOut = 1 - Math.pow(1 - progress, 4);
            setCount(Math.floor(value * easeOut));
            if (progress < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.5 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [value, hasAnimated]);

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toLocaleString();
  };

  return (
    <span ref={ref} className="tabular-nums">
      {prefix}{formatNumber(count)}{suffix}
    </span>
  );
}

// Floating particle component
function FloatingParticle({ delay, size, left, duration }: { delay: number; size: number; left: string; duration: number }) {
  return (
    <div 
      className="absolute bottom-0 rounded-full bg-gradient-to-t from-[#01C38E]/40 to-[#0A786A]/20 blur-sm"
      style={{
        width: size,
        height: size,
        left,
        animation: `float-up ${duration}s ease-in-out infinite`,
        animationDelay: `${delay}s`,
      }}
    />
  );
}

// Hook to fetch real protocol stats - Now uses cached API for speed
function useProtocolStats() {
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalVolume, setTotalVolume] = useState(0);
  const [isLoadingVolume, setIsLoadingVolume] = useState(true);

  // Fetch on-chain TVL data from pools and vault (real-time)
  // Note: Only 3 calls — well within Arc v0.7.2's 100-entry batch cap.
  // If pools expand beyond ~90, use chunkedMulticall from @/utils/rpc-error-handler
  const { data: contractData } = useReadContracts({
    contracts: [
      // USDC-EURC Pool reserves
      {
        address: CONTRACTS.USDC_EURC_POOL,
        abi: XYLO_POOL_ABI,
        functionName: 'getReserves',
      },
      // USDC-USYC Pool reserves
      {
        address: CONTRACTS.USDC_USYC_POOL,
        abi: XYLO_POOL_ABI,
        functionName: 'getReserves',
      },
      // Vault total assets
      {
        address: CONTRACTS.VAULT,
        abi: XYLO_VAULT_ABI,
        functionName: 'totalAssets',
      },
    ],
  });

  // Fetch cached stats from API (fast, updated every 15 min by cron)
  useEffect(() => {
    async function fetchStats() {
      try {
        setIsLoadingVolume(true);
        const res = await fetch('/api/stats');
        const data = await res.json();
        
        if (data.success && data.data) {
          setTotalUsers(data.data.total_users || 0);
          setTotalVolume(data.data.total_volume || 0);
        }
      } catch (e) {
        console.error('Failed to fetch stats:', e);
        // Fallback: try to get user count
        try {
          const userRes = await fetch('/api/users?count=true');
          const userData = await userRes.json();
          setTotalUsers(userData.count || 0);
        } catch {}
      } finally {
        setIsLoadingVolume(false);
      }
    }
    fetchStats();
  }, []);

  // Calculate TVL from contract data (real-time on-chain)
  let tvl = 0;
  
  if (contractData) {
    // Pool 1 reserves (USDC-EURC)
    if (contractData[0]?.result) {
      const [reserve0, reserve1] = contractData[0].result as [bigint, bigint];
      tvl += Number(formatUnits(reserve0, 6)) + Number(formatUnits(reserve1, 6));
    }
    // Pool 2 reserves (USDC-USYC)
    if (contractData[1]?.result) {
      const [reserve0, reserve1] = contractData[1].result as [bigint, bigint];
      tvl += Number(formatUnits(reserve0, 6)) + Number(formatUnits(reserve1, 6));
    }
    // Vault total assets
    if (contractData[2]?.result) {
      tvl += Number(formatUnits(contractData[2].result as bigint, 6));
    }
  }

  return {
    tvl: Math.round(tvl),
    totalUsers,
    totalVolume: Math.round(totalVolume),
    isLoadingVolume,
  };
}

export default function Hero() {
  const [isVisible, setIsVisible] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0.5, y: 0.5 });
  const { tvl, totalUsers, totalVolume } = useProtocolStats();

  useEffect(() => {
    setIsVisible(true);
    
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated mesh gradient background */}
      <div className="absolute inset-0 bg-[#0f172a]">
        {/* Primary gradient blob - Teal */}
        <div 
          className="absolute w-[1000px] h-[1000px] rounded-full opacity-30 blur-[150px]"
          style={{
            background: 'radial-gradient(circle, rgba(1,195,142,0.6) 0%, rgba(10,120,106,0.4) 50%, transparent 70%)',
            top: `calc(20% + ${(mousePosition.y - 0.5) * 50}px)`,
            left: `calc(30% + ${(mousePosition.x - 0.5) * 50}px)`,
            transition: 'top 0.8s ease-out, left 0.8s ease-out',
          }}
        />
        
        {/* Secondary gradient blob - Dark teal */}
        <div 
          className="absolute w-[800px] h-[800px] rounded-full opacity-20 blur-[120px]"
          style={{
            background: 'radial-gradient(circle, rgba(10,120,106,0.8) 0%, rgba(19,45,70,0.5) 60%, transparent 70%)',
            bottom: `calc(10% + ${(mousePosition.y - 0.5) * -30}px)`,
            right: `calc(20% + ${(mousePosition.x - 0.5) * -30}px)`,
            transition: 'bottom 0.8s ease-out, right 0.8s ease-out',
          }}
        />

        {/* Accent blob - Subtle teal */}
        <div 
          className="absolute w-[600px] h-[600px] rounded-full opacity-15 blur-[100px]"
          style={{
            background: 'radial-gradient(circle, rgba(1,195,142,0.4) 0%, transparent 60%)',
            top: '60%',
            left: '60%',
          }}
        />

        {/* Noise texture overlay */}
        <div 
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />

        {/* Grid pattern */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
                             linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />

        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <FloatingParticle delay={0} size={4} left="10%" duration={15} />
          <FloatingParticle delay={2} size={6} left="20%" duration={18} />
          <FloatingParticle delay={4} size={3} left="35%" duration={12} />
          <FloatingParticle delay={1} size={5} left="50%" duration={20} />
          <FloatingParticle delay={3} size={4} left="65%" duration={16} />
          <FloatingParticle delay={5} size={7} left="80%" duration={22} />
          <FloatingParticle delay={2.5} size={3} left="90%" duration={14} />
        </div>
      </div>

      {/* Floating PNG Assets */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Main coin - floating on the right */}
        <div 
          className="absolute right-[5%] top-[20%] w-32 h-32 md:w-48 md:h-48 lg:w-64 lg:h-64 opacity-20 animate-float"
          style={{
            transform: `translate(${(mousePosition.x - 0.5) * -20}px, ${(mousePosition.y - 0.5) * -20}px)`,
            transition: 'transform 0.5s ease-out',
          }}
        >
          <img 
            src="/branding/coin-main.png" 
            alt="" 
            className="w-full h-full object-contain drop-shadow-2xl"
          />
        </div>
        
        {/* 3D icon - floating on the left */}
        <div 
          className="absolute left-[3%] top-[35%] w-20 h-20 md:w-32 md:h-32 lg:w-40 lg:h-40 opacity-15 animate-float-delayed"
          style={{
            transform: `translate(${(mousePosition.x - 0.5) * 15}px, ${(mousePosition.y - 0.5) * 15}px)`,
            transition: 'transform 0.5s ease-out',
          }}
        >
          <img 
            src="/branding/3d-icon.png" 
            alt="" 
            className="w-full h-full object-contain drop-shadow-xl"
          />
        </div>
        
        {/* Coin alt - smaller, bottom left */}
        <div 
          className="absolute left-[15%] bottom-[15%] w-16 h-16 md:w-24 md:h-24 opacity-10 animate-float-slow hidden md:block"
          style={{
            transform: `translate(${(mousePosition.x - 0.5) * 10}px, ${(mousePosition.y - 0.5) * 10}px)`,
            transition: 'transform 0.5s ease-out',
          }}
        >
          <img 
            src="/branding/coin-alt.png" 
            alt="" 
            className="w-full h-full object-contain"
          />
        </div>
      </div>

      {/* Main content */}
      <div className="relative z-10 text-center max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        {/* Trust badge row */}
        <div 
          className={`flex flex-wrap items-center justify-center gap-3 mb-8 transition-all duration-1000 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <div className="flex items-center gap-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full px-4 py-2">
            <div className="w-2 h-2 bg-[#01C38E] rounded-full animate-pulse" />
            <span className="text-sm text-gray-300">Live on Arc Testnet</span>
          </div>
          <div className="flex items-center gap-2 bg-[#01C38E]/10 backdrop-blur-sm border border-[#01C38E]/20 rounded-full px-4 py-2">
            <img src="/chains/arc.png" alt="Arc" className="w-4 h-4" />
            <span className="text-sm text-[#01C38E]">Powered by Arc</span>
          </div>
          <div className="flex items-center gap-2 bg-[#0A786A]/10 backdrop-blur-sm border border-[#0A786A]/20 rounded-full px-4 py-2">
            <svg className="w-4 h-4 text-[#0A786A]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span className="text-sm text-[#0A786A]">Secure</span>
          </div>
        </div>

        {/* Main headline with kinetic typography */}
        <div className={`mb-6 transition-all duration-1000 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-bold tracking-tight">
            <span className="block text-white mb-2 leading-[1.1]">
              The Stablecoin
            </span>
            <span className="relative inline-block">
              <span className="relative z-10 bg-gradient-to-r from-[#132D46] via-[#0A786A] to-[#01C38E] text-transparent bg-clip-text leading-[1.1]">
                SuperExchange
              </span>
              {/* Animated underline - positioned below descender letters */}
              <span className="absolute -bottom-4 left-0 right-0 h-[3px] bg-gradient-to-r from-[#132D46] via-[#0A786A] to-[#01C38E] rounded-full transform origin-left animate-expand" />
            </span>
          </h1>
        </div>

        {/* Subheadline */}
        <p className={`text-lg sm:text-xl md:text-2xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          Swap stablecoins with <span className="text-[#01C38E] font-medium">near-zero slippage</span>. 
          Bridge across <span className="text-[#0A786A] font-medium">20+ chains</span> in one click.
          All on <span className="text-[#01C38E] font-medium">Arc Network</span>.
        </p>

        {/* CTA Buttons */}
        <div className={`flex flex-col sm:flex-row gap-4 justify-center mb-16 transition-all duration-1000 delay-400 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <Link
            href="/swap"
            className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 overflow-hidden rounded-2xl font-bold text-lg text-white transition-all duration-300 hover:scale-105 active:scale-95"
          >
            {/* Gradient background - Teal */}
            <span className="absolute inset-0 bg-gradient-to-r from-[#132D46] via-[#0A786A] to-[#01C38E]" />
            {/* Animated shine */}
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
            {/* Glow effect */}
            <span className="absolute -inset-1 bg-gradient-to-r from-[#132D46] via-[#0A786A] to-[#01C38E] rounded-2xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
            
            <span className="relative flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Launch App
              <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </span>
          </Link>
          
          <Link
            href="/bridge"
            className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl font-semibold text-lg text-white bg-white/5 border border-white/10 hover:bg-[#01C38E]/10 hover:border-[#01C38E]/30 transition-all duration-300 hover:scale-105 active:scale-95 backdrop-blur-sm"
          >
            <svg className="w-5 h-5 text-[#01C38E]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
            Bridge USDC
          </Link>
        </div>

        {/* Live stats - Real on-chain data */}
        <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 max-w-4xl mx-auto transition-all duration-1000 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          {[
            { label: 'Total Value Locked', value: tvl, prefix: '$', suffix: '', isLive: true },
            { label: 'Total Volume', value: totalVolume, prefix: '$', suffix: '', isLive: true },
            { label: 'Unique Users', value: totalUsers, prefix: '', suffix: '', isLive: true },
            { label: 'Avg. Gas Cost', value: 0.01, prefix: '~$', suffix: '', isLive: false },
          ].map((stat) => (
            <div 
              key={stat.label}
              className="relative group"
            >
              <div className="absolute -inset-0.5 bg-gradient-to-r from-[#0A786A]/20 to-[#01C38E]/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 md:p-6 hover:border-[#01C38E]/30 transition-all duration-300">
                <div className="text-2xl md:text-3xl font-bold text-white mb-1 flex items-center justify-center gap-2">
                  {stat.value < 1 ? (
                    <span>{stat.prefix}{stat.value}{stat.suffix}</span>
                  ) : (
                    <AnimatedCounter value={stat.value} prefix={stat.prefix} suffix={stat.suffix} />
                  )}
                  {stat.isLive && (
                    <span className="w-2 h-2 bg-[#01C38E] rounded-full animate-pulse" title="Live data" />
                  )}
                </div>
                <div className="text-xs md:text-sm text-gray-400">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Scroll indicator */}
        <div className={`mt-16 md:mt-20 transition-all duration-1000 delay-700 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
          <div className="flex flex-col items-center gap-3 text-gray-500">
            <span className="text-sm tracking-wider uppercase">Explore</span>
            <div className="relative w-6 h-10 border-2 border-gray-600 rounded-full">
              <div className="absolute top-2 left-1/2 -translate-x-1/2 w-1.5 h-3 bg-gradient-to-b from-white to-gray-500 rounded-full animate-scroll-down" />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#0f172a] via-[#0f172a]/80 to-transparent" />
    </section>
  );
}
