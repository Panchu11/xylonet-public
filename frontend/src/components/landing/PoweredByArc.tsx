'use client';

import { useEffect, useRef, useState } from 'react';

const arcFeatures = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M12 7v5l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    title: 'Sub-Second Finality',
    description: 'Deterministic settlement',
    metric: '<350ms',
    color: 'from-[#0A786A] to-[#01C38E]',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M12 7v6M9 14h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    title: 'Native USDC Gas',
    description: 'Pay fees in stablecoins',
    metric: 'USDC',
    color: 'from-[#132D46] to-[#0A786A]',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7">
        <path d="M12 2L4 7l8 5 8-5-8-5z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M4 12l8 5 8-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M4 17l8 5 8-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: 'Circle CCTP V2',
    description: 'Native cross-chain',
    metric: '20+ Chains',
    color: 'from-[#01C38E] to-[#0A786A]',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7">
        <path d="M12 3l9 4.5v5c0 4.69-3.75 8.69-9 10.5-5.25-1.81-9-5.81-9-10.5v-5L12 3z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: 'Enterprise Grade',
    description: 'Institutional security',
    metric: 'SOC 2',
    color: 'from-[#0A786A] to-[#132D46]',
  },
];

function FeatureCard({ feature, index }: { feature: typeof arcFeatures[0]; index: number }) {
  const [isHovered, setIsHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
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

  return (
    <div
      ref={cardRef}
      className={`relative group transition-all duration-700 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      }`}
      style={{ transitionDelay: `${index * 100 + 200}ms` }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Gradient glow on hover */}
      <div 
        className={`absolute -inset-0.5 bg-gradient-to-r ${feature.color} rounded-2xl blur-lg opacity-0 transition-opacity duration-500 ${
          isHovered ? 'opacity-40' : ''
        }`}
      />
      
      <div className="relative bg-white/[0.02] backdrop-blur-sm border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-all duration-500 h-full">
        {/* Metric badge */}
        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-gradient-to-r ${feature.color} bg-opacity-10 mb-4`}>
          <span className="text-sm font-bold text-white">{feature.metric}</span>
        </div>
        
        {/* Icon */}
        <div 
          className={`w-12 h-12 rounded-xl bg-gradient-to-r ${feature.color} bg-opacity-10 flex items-center justify-center text-[#01C38E] mb-3 transition-transform duration-300 ${
            isHovered ? 'scale-110' : ''
          }`}
        >
          {feature.icon}
        </div>
        
        {/* Text */}
        <h4 className="text-base font-semibold text-white mb-1">{feature.title}</h4>
        <p className="text-sm text-gray-500">{feature.description}</p>
      </div>
    </div>
  );
}

export default function PoweredByArc() {
  const [isVisible, setIsVisible] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0.5, y: 0.5 });
  const sectionRef = useRef<HTMLElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

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

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePosition({
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height,
    });
  };

  return (
    <section ref={sectionRef} className="relative py-24 md:py-32 px-4 overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[800px] bg-gradient-to-r from-[#132D46]/10 via-[#0A786A]/8 to-[#01C38E]/10 rounded-full blur-[150px]" />
      </div>
      
      {/* Floating PNG decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute left-[3%] top-[20%] w-28 h-28 md:w-44 md:h-44 opacity-15 animate-float hidden lg:block">
          <img 
            src="/branding/coin-main.png" 
            alt="" 
            className="w-full h-full object-contain drop-shadow-xl"
          />
        </div>
        <div className="absolute right-[5%] bottom-[15%] w-20 h-20 md:w-32 md:h-32 opacity-12 animate-float-delayed hidden md:block">
          <img 
            src="/branding/3d-icon.png" 
            alt="" 
            className="w-full h-full object-contain"
          />
        </div>
      </div>
      
      <div className="relative z-10 max-w-6xl mx-auto">
        <div 
          className={`transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          {/* Main showcase card */}
          <div 
            ref={cardRef}
            className="relative group"
            onMouseMove={handleMouseMove}
          >
            {/* Animated border gradient */}
            <div className="absolute -inset-[1px] bg-gradient-to-r from-[#132D46] via-[#0A786A] to-[#01C38E] rounded-[28px] opacity-20 blur-sm" />
            <div className="absolute -inset-[1px] bg-gradient-to-r from-[#132D46] via-[#0A786A] to-[#01C38E] rounded-[28px] opacity-10" />
            
            {/* Spotlight effect */}
            <div 
              className="absolute -inset-px rounded-[28px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
              style={{
                background: `radial-gradient(800px circle at ${mousePosition.x * 100}% ${mousePosition.y * 100}%, rgba(56,189,248,0.1), transparent 40%)`,
              }}
            />
            
            <div className="relative bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] border border-white/5 rounded-[28px] p-8 md:p-12 lg:p-16 overflow-hidden">
              {/* Inner glow */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[250px] bg-gradient-to-b from-[#01C38E]/10 to-transparent rounded-full blur-[100px]" />
              
              <div className="relative">
                {/* Badge */}
                <div className="flex justify-center mb-8">
                  <div className="inline-flex items-center gap-2.5 bg-gradient-to-r from-[#0A786A]/10 to-[#01C38E]/10 border border-[#01C38E]/20 rounded-full px-5 py-2.5">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#01C38E] opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-[#01C38E]"></span>
                    </span>
                    <span className="text-[#01C38E] text-sm font-medium tracking-wide">Built On</span>
                  </div>
                </div>
                
                {/* Arc branding */}
                <div className="text-center mb-12">
                  <a 
                    href="https://www.arc.network/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex flex-col sm:flex-row items-center gap-4 md:gap-6 group/link mb-6"
                  >
                    <div className="relative">
                      {/* Logo container - clean without glow */}
                      <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-[#0f172a] border border-white/10 flex items-center justify-center overflow-hidden">
                        <img src="/chains/arc.png" alt="Arc Network" className="w-14 md:w-16 h-14 md:h-16 object-contain" />
                      </div>
                    </div>
                    <div className="text-center sm:text-left">
                      <h3 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white group-hover/link:text-[#01C38E] transition-colors duration-300">
                        Arc Network
                      </h3>
                      <p className="text-base md:text-lg text-gray-500 mt-1 flex items-center justify-center sm:justify-start gap-2">
                        <span>by</span>
                        <span className="text-[#01C38E] font-medium">Circle</span>
                      </p>
                    </div>
                  </a>
                  
                  <p className="text-base md:text-lg lg:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
                    Circle&apos;s Layer 1 blockchain purpose-built for stablecoin applications — 
                    <span className="text-white"> institutional security</span> meets 
                    <span className="text-[#01C38E]"> DeFi innovation</span>.
                  </p>
                </div>

                {/* Features grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {arcFeatures.map((feature, index) => (
                    <FeatureCard key={feature.title} feature={feature} index={index} />
                  ))}
                </div>

                {/* CTAs */}
                <div className="mt-10 md:mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
                  <a
                    href="https://www.arc.network/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group/btn relative inline-flex items-center justify-center gap-2.5 px-7 py-3.5 overflow-hidden rounded-xl font-semibold text-white transition-all duration-300 hover:scale-105 active:scale-95"
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-[#0A786A] to-[#01C38E]" />
                    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover/btn:translate-x-[200%] transition-transform duration-700" />
                    <span className="relative flex items-center gap-2">
                      Explore Arc Network
                      <svg className="w-4 h-4 transform group-hover/btn:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </span>
                  </a>
                  
                  <a
                    href="https://faucet.circle.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2.5 px-7 py-3.5 bg-white/5 border border-white/10 rounded-xl font-semibold text-white hover:bg-white/10 hover:border-white/20 transition-all duration-300 hover:scale-105 active:scale-95"
                  >
                    <svg className="w-4 h-4 text-[#01C38E]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Get Testnet USDC
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Trust badge */}
        <div 
          className={`mt-10 text-center transition-all duration-700 delay-500 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-white/[0.02] border border-white/5 rounded-full">
            <div className="w-5 h-5 rounded-full bg-gradient-to-r from-[#0A786A] to-[#01C38E] flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-3 h-3 text-white" fill="currentColor">
                <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
              </svg>
            </div>
            <span className="text-sm text-gray-400">Built on Circle&apos;s trusted infrastructure</span>
          </div>
        </div>
      </div>
    </section>
  );
}
