'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

interface Feature {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  gradient: string;
  size: 'normal' | 'large' | 'wide' | 'center';
  link?: string;
  metric?: { value: string; label: string };
}

const features: Feature[] = [
  {
    id: 'swap',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8">
        <path d="M7 16V4m0 0L3 8m4-4l4 4m6 4v12m0 0l4-4m-4 4l-4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: 'StableSwap AMM',
    description: 'Trade USDC, EURC with near-zero slippage using Curve\'s battle-tested invariant algorithm. Optimized for stablecoin pairs.',
    gradient: 'from-[#0A786A] to-[#01C38E]',
    size: 'large',
    link: '/swap',
    metric: { value: '0.04%', label: 'Swap Fee' },
  },
  {
    id: 'bridge',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8">
        <path d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: 'Cross-Chain Bridge',
    description: 'Native USDC transfers across 20+ chains via Circle App Kit. One-click bridging with single-sign forwarding.',
    gradient: 'from-[#132D46] to-[#0A786A]',
    size: 'normal',
    link: '/bridge',
    metric: { value: '~30s', label: 'Transfer Time' },
  },
  {
    id: 'vault',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8">
        <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
        <path d="M3 9h18M9 21V9" stroke="currentColor" strokeWidth="2"/>
        <circle cx="6" cy="6" r="1" fill="currentColor"/>
      </svg>
    ),
    title: 'Yield Vault',
    description: 'ERC-4626 compliant vaults for passive income on your stablecoins.',
    gradient: 'from-[#01C38E] to-[#0A786A]',
    size: 'normal',
    link: '/vault',
    metric: { value: 'Auto', label: 'Compound' },
  },
  {
    id: 'speed',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: 'Sub-Second Finality',
    description: 'Arc Network delivers <350ms transaction finality. No more waiting or uncertainty.',
    gradient: 'from-[#0A786A] to-[#01C38E]',
    size: 'wide',
    metric: { value: '<350ms', label: 'Finality' },
  },
  {
    id: 'fees',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
        <path d="M12 6v12M9 9h6M9 15h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
    title: 'Ultra Low Fees',
    description: 'Pay ~$0.01 per transaction using native USDC for gas. No ETH required.',
    gradient: 'from-[#132D46] to-[#01C38E]',
    size: 'normal',
    metric: { value: '~$0.01', label: 'Per Tx' },
  },
  {
    id: 'security',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8">
        <path d="M12 3l9 4.5v5c0 4.69-3.75 8.69-9 10.5-5.25-1.81-9-5.81-9-10.5v-5L12 3z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: 'Enterprise Security',
    description: 'Built on Circle\'s institutional-grade infrastructure with audited contracts.',
    gradient: 'from-[#0A786A] to-[#132D46]',
    size: 'center',
    metric: { value: '100%', label: 'Secure' },
  },
];

function FeatureCard({ feature, index }: { feature: Feature; index: number }) {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.1 }
    );

    if (cardRef.current) observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, []);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePos({
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height,
    });
  };

  const cardContent = (
    <>
      {/* Card content */}
      <div className={`p-6 md:p-8 h-full flex flex-col ${feature.size === 'large' ? 'md:p-10' : ''}`}>
        {/* Icon with gradient background */}
        <div 
          className={`w-14 h-14 md:w-16 md:h-16 rounded-xl bg-gradient-to-br ${feature.gradient} p-[2px] mb-4 md:mb-6 transition-transform duration-500 ${
            isHovered ? 'scale-110 rotate-3' : ''
          }`}
        >
          <div className="w-full h-full bg-[#1e293b] rounded-[10px] flex items-center justify-center text-white">
            {feature.icon}
          </div>
        </div>
        
        {/* Title */}
        <h3 className={`font-bold text-white mb-2 md:mb-3 ${
          feature.size === 'large' ? 'text-2xl md:text-3xl' : 'text-lg md:text-xl'
        }`}>
          {feature.title}
        </h3>
        
        {/* Description */}
        <p className={`text-gray-400 leading-relaxed flex-grow ${
          feature.size === 'large' ? 'text-base md:text-lg' : 'text-sm md:text-base'
        }`}>
          {feature.description}
        </p>
        
        {/* Metric badge */}
        {feature.metric && (
          <div className="mt-4 md:mt-6 flex items-center gap-3">
            <div className={`px-4 py-2 rounded-xl bg-gradient-to-r ${feature.gradient} bg-opacity-10`}>
              <span className="text-lg md:text-xl font-bold text-white">{feature.metric.value}</span>
            </div>
            <span className="text-sm text-gray-500">{feature.metric.label}</span>
          </div>
        )}
        
        {/* Arrow indicator for linked cards */}
        {feature.link && (
          <div className={`absolute bottom-6 right-6 md:bottom-8 md:right-8 w-10 h-10 rounded-full bg-white/5 flex items-center justify-center transition-all duration-300 ${
            isHovered ? 'bg-white/10 scale-110' : ''
          }`}>
            <svg 
              className={`w-5 h-5 text-white/50 transition-all duration-300 ${isHovered ? 'text-white translate-x-0.5' : ''}`} 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </div>
        )}
      </div>
      
      {/* Holographic shine effect */}
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
        style={{
          background: `linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.03) 45%, rgba(255,255,255,0.06) 50%, rgba(255,255,255,0.03) 55%, transparent 60%)`,
          transform: isHovered ? 'translateX(100%)' : 'translateX(-100%)',
          transition: 'transform 0.7s ease-in-out, opacity 0.3s',
        }}
      />
    </>
  );

  const cardClassName = `relative block h-full bg-[#1e293b]/80 backdrop-blur-sm border border-white/5 rounded-2xl md:rounded-3xl overflow-hidden transition-all duration-500 group-hover:border-[#01C38E]/20`;

  return (
    <div
      ref={cardRef}
      className={`relative group transition-all duration-700 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      } ${
        feature.size === 'large' ? 'md:col-span-2 md:row-span-2' :
        feature.size === 'wide' ? 'md:col-span-2' :
        feature.size === 'center' ? 'md:col-start-2' : ''
      }`}
      style={{ transitionDelay: `${index * 100}ms` }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseMove={handleMouseMove}
    >
      {/* Gradient glow effect on hover */}
      <div 
        className={`absolute -inset-0.5 bg-gradient-to-r ${feature.gradient} rounded-2xl md:rounded-3xl opacity-0 blur-xl transition-all duration-500 ${
          isHovered ? 'opacity-40' : ''
        }`}
      />
      
      {/* Spotlight effect following mouse */}
      <div 
        className="absolute -inset-px rounded-2xl md:rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background: `radial-gradient(600px circle at ${mousePos.x * 100}% ${mousePos.y * 100}%, rgba(255,255,255,0.06), transparent 40%)`,
        }}
      />
      
      {feature.link ? (
        <Link href={feature.link} className={cardClassName}>
          {cardContent}
        </Link>
      ) : (
        <div className={cardClassName}>
          {cardContent}
        </div>
      )}
    </div>
  );
}

export default function Features() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="relative py-24 md:py-32 px-4 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#01C38E]/5 rounded-full blur-[150px]" />
      </div>
      
      {/* Floating PNG decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Coin on the right */}
        <div className="absolute right-[2%] top-[10%] w-24 h-24 md:w-36 md:h-36 opacity-15 animate-float-delayed">
          <img 
            src="/branding/coin-main.png" 
            alt="" 
            className="w-full h-full object-contain drop-shadow-xl"
          />
        </div>
        
        {/* 3D icon on the left */}
        <div className="absolute left-[5%] bottom-[15%] w-20 h-20 md:w-28 md:h-28 opacity-12 animate-float-slow hidden lg:block">
          <img 
            src="/branding/3d-icon.png" 
            alt="" 
            className="w-full h-full object-contain"
          />
        </div>
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Section header */}
        <div 
          className={`text-center mb-16 md:mb-20 transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <div className="inline-flex items-center gap-2 bg-[#01C38E]/10 border border-[#01C38E]/20 rounded-full px-5 py-2.5 mb-6 md:mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#01C38E] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#01C38E]"></span>
            </span>
            <span className="text-[#01C38E] text-sm font-medium tracking-wide">Why XyloNet</span>
          </div>
          
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-4 md:mb-6 tracking-tight">
            Everything You Need for{' '}
            <span className="relative">
              <span className="relative z-10 bg-gradient-to-r from-[#132D46] via-[#0A786A] to-[#01C38E] text-transparent bg-clip-text">
                Stablecoins
              </span>
            </span>
          </h2>
          
          <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto">
            A complete DeFi hub for stablecoin trading, bridging, and earning — all powered by Arc Network&apos;s lightning-fast infrastructure.
          </p>
        </div>

        {/* Bento grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {features.map((feature, index) => (
            <FeatureCard key={feature.id} feature={feature} index={index} />
          ))}
        </div>
        
        {/* Bottom CTA */}
        <div 
          className={`mt-16 md:mt-20 text-center transition-all duration-700 delay-500 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <Link
            href="/swap"
            className="inline-flex items-center gap-3 px-8 py-4 bg-white/5 border border-white/10 rounded-2xl font-semibold text-white hover:bg-[#01C38E]/10 hover:border-[#01C38E]/30 transition-all duration-300 group"
          >
            <span>Start Trading Now</span>
            <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
