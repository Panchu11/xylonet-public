'use client';

import { useEffect, useRef, useState } from 'react';

const tokens = [
  {
    name: 'USDC',
    fullName: 'USD Coin',
    color: '#2775CA',
    icon: '/tokens/usdc.png',
    description: 'The world\'s most trusted stablecoin',
  },
  {
    name: 'EURC',
    fullName: 'Euro Coin',
    color: '#5D7CBA',
    icon: '/tokens/eurc.png',
    description: 'Euro-backed stablecoin by Circle',
  },
];

const chains = [
  { name: 'Arc', icon: '/chains/arc.png', color: '#00C2FF', highlight: true },
  { name: 'Ethereum', icon: '/chains/ethereum.svg', color: '#627EEA' },
  { name: 'Arbitrum', icon: '/chains/arbitrum.svg', color: '#28A0F0' },
  { name: 'Base', icon: '/chains/base.jpg', color: '#0052FF' },
  { name: 'Optimism', icon: '/chains/optimism.svg', color: '#FF0420' },
  { name: 'Polygon', icon: '/chains/polygon.svg', color: '#8247E5' },
  { name: 'Avalanche', icon: '/chains/avalanche.svg', color: '#E84142' },
  { name: 'Linea', icon: '/chains/linea.png', color: '#61DFFF' },
  { name: 'Sonic', icon: '/chains/sonic.png', color: '#5B6EF5' },
  { name: 'Unichain', icon: '/chains/unichain.png', color: '#FF007A' },
  { name: 'World Chain', icon: '/chains/worldchain.png', color: '#000000' },
  { name: 'Monad', icon: '/chains/monad.svg', color: '#836EF9' },
  { name: 'Morph', icon: '/chains/morph.jpg', color: '#2D5BE3' },
  { name: 'Edge', icon: '/chains/edgeX.jpg', color: '#4F46E5' },
];

function TokenCard({ token, index }: { token: typeof tokens[0]; index: number }) {
  const [isHovered, setIsHovered] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePos({
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height,
    });
  };

  return (
    <div
      ref={cardRef}
      className="relative group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseMove={handleMouseMove}
    >
      {/* Glow effect */}
      <div 
        className={`absolute -inset-1 rounded-3xl blur-xl opacity-0 transition-opacity duration-500 ${isHovered ? 'opacity-50' : ''}`}
        style={{ backgroundColor: token.color }}
      />
      
      {/* Spotlight effect */}
      <div 
        className="absolute -inset-px rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background: `radial-gradient(400px circle at ${mousePos.x * 100}% ${mousePos.y * 100}%, ${token.color}20, transparent 40%)`,
        }}
      />
      
      <div className="relative bg-[#0d0e12]/80 backdrop-blur-sm border border-white/5 rounded-3xl p-8 md:p-10 hover:border-white/10 transition-all duration-500 text-center h-full">
        {/* Token icon - clean without always-visible glow */}
        <div className="relative w-24 h-24 mx-auto mb-6">
          <div 
            className={`absolute inset-0 rounded-full blur-2xl transition-opacity duration-500 ${isHovered ? 'opacity-40' : 'opacity-0'}`}
            style={{ backgroundColor: token.color }}
          />
          <div 
            className="relative w-full h-full rounded-full flex items-center justify-center"
            style={{ backgroundColor: `${token.color}15` }}
          >
            <img src={token.icon} alt={token.name} className="w-14 h-14 object-contain" />
          </div>
        </div>
        
        {/* Token name */}
        <h4 className="text-2xl md:text-3xl font-bold text-white mb-2">{token.name}</h4>
        <p className="text-sm text-gray-500 mb-4">{token.fullName}</p>
        <p className="text-sm text-gray-400">{token.description}</p>
        
        {/* Status badge */}
        <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-xs text-gray-400">Trading Live</span>
        </div>
      </div>
    </div>
  );
}

function ChainBadge({ chain, index }: { chain: typeof chains[0]; index: number }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="relative group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Border glow for highlighted chain only on hover */}
      {chain.highlight && (
        <div className="absolute -inset-[1px] bg-gradient-to-r from-[#01C38E] to-[#0A786A] rounded-2xl opacity-0 group-hover:opacity-30 transition-opacity" />
      )}
      
      <div 
        className={`relative flex items-center gap-3 md:gap-4 px-5 md:px-6 py-3 md:py-4 rounded-xl md:rounded-2xl border transition-all duration-300 ${
          chain.highlight 
            ? 'bg-gradient-to-r from-[#01C38E]/10 to-[#0A786A]/10 border-[#01C38E]/30 hover:border-[#01C38E]/50' 
            : 'bg-white/5 border-white/5 hover:border-white/15 hover:bg-white/10'
        }`}
      >
        <div 
          className={`w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110 ${
            chain.highlight ? 'bg-[#0f172a] border border-white/10' : ''
          }`}
          style={chain.highlight ? undefined : { backgroundColor: `${chain.color}15` }}
        >
          <img src={chain.icon} alt={chain.name} className="w-6 md:w-7 h-6 md:h-7 object-contain" />
        </div>
        <div>
          <span className={`text-base md:text-lg font-medium ${chain.highlight ? 'text-[#01C38E]' : 'text-white'}`}>
            {chain.name}
          </span>
          {chain.highlight && (
            <div className="text-xs text-[#01C38E]/70">Home Chain</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SupportedAssets() {
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
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-[#01C38E]/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-[#0A786A]/5 rounded-full blur-[150px]" />
      </div>
      
      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Tokens section */}
        <div 
          className={`text-center mb-16 transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <div className="inline-flex items-center gap-2 bg-[#01C38E]/10 border border-[#01C38E]/20 rounded-full px-5 py-2.5 mb-6 md:mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#01C38E] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#01C38E]"></span>
            </span>
            <span className="text-[#01C38E] text-sm font-medium tracking-wide">Supported Assets</span>
          </div>
          
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-4 md:mb-6 tracking-tight">
            Trade Circle&apos;s{' '}
            <span className="bg-gradient-to-r from-[#01C38E] to-[#01C38E] text-transparent bg-clip-text">
              Premium Stablecoins
            </span>
          </h2>
          
          <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto">
            Access the most trusted stablecoins in DeFi, backed by Circle&apos;s regulated reserves.
          </p>
        </div>

        {/* Token cards */}
        <div 
          className={`grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-24 max-w-4xl mx-auto transition-all duration-700 delay-200 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          {tokens.map((token, index) => (
            <TokenCard key={token.name} token={token} index={index} />
          ))}
        </div>

        {/* Chains section */}
        <div 
          className={`text-center mb-10 md:mb-12 transition-all duration-700 delay-300 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 md:mb-4">
            Bridge Across{' '}
            <span className="bg-gradient-to-r from-[#0A786A] to-[#01C38E] text-transparent bg-clip-text">
              20+ Networks
            </span>
          </h3>
          <p className="text-gray-400 text-base md:text-lg max-w-xl mx-auto">
            Move USDC seamlessly via Circle App Kit. One-click bridging — no wrapped tokens, no extra gas needed.
          </p>
        </div>

        {/* Chain badges */}
        <div 
          className={`flex flex-wrap justify-center gap-4 md:gap-5 transition-all duration-700 delay-400 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          {chains.map((chain, index) => (
            <ChainBadge key={chain.name} chain={chain} index={index} />
          ))}
        </div>
        
        {/* CCTP Badge */}
        <div 
          className={`mt-12 md:mt-16 flex justify-center transition-all duration-700 delay-500 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-white/5 border border-white/10 rounded-2xl">
            <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span className="text-sm text-gray-300">Powered by Circle App Kit &middot; CCTP V2 &middot; Single-Sign Forwarding</span>
          </div>
        </div>
      </div>
    </section>
  );
}
