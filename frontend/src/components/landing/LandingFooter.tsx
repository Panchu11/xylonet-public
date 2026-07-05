'use client';

import Link from 'next/link';
import { useState } from 'react';

const footerLinks = {
  products: [
    { name: 'Swap', href: '/swap', description: 'StableSwap AMM' },
    { name: 'Bridge', href: '/bridge', description: 'Cross-chain transfers' },
    { name: 'Pools', href: '/pools', description: 'Provide liquidity' },
    { name: 'Vault', href: '/vault', description: 'Earn yield' },
    { name: 'Faucet', href: '/faucet', description: 'Get testnet USDC', featured: true },
    { name: 'PayX', href: '/payx', description: 'Tip on X/Twitter' },
    { name: 'Facilitator', href: '/xylofacilitator', description: 'Monetize APIs with x402' },
  ],
  resources: [
    { name: 'Documentation', href: '/docs', disabled: false },
    { name: 'GitHub', href: '#', disabled: true },
    { name: 'Arc Network', href: 'https://www.arc.network/', external: true },
    { name: 'Circle CCTP', href: 'https://www.circle.com/en/cross-chain-transfer-protocol', external: true },
  ],
  community: [
    { name: 'Twitter / X', href: 'https://x.com/Xylonet_', external: true, icon: 'twitter' },
  ],
};

export default function LandingFooter() {
  const currentYear = new Date().getFullYear();
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);

  return (
    <footer className="relative border-t border-white/5 bg-[#0f172a]">
      {/* Top gradient line - Teal */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#01C38E]/50 to-transparent" />
      
      {/* Background effects - Teal */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute bottom-0 left-1/4 w-[600px] h-[300px] bg-[#01C38E]/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[200px] bg-[#0A786A]/5 rounded-full blur-[120px]" />
      </div>
      
      <div className="relative z-10 max-w-6xl mx-auto px-4">
        {/* Main footer content */}
        <div className="py-16 md:py-20">
          <div className="grid grid-cols-2 md:grid-cols-12 gap-8 md:gap-12">
            {/* Brand column */}
            <div className="col-span-2 md:col-span-4">
              <div className="flex items-center gap-3 mb-5">
                <div className="relative">
                  <div className="relative w-11 h-11 rounded-xl bg-[#1e293b] border border-white/10 flex items-center justify-center">
                    <img src="/branding/xylonet-gradient.svg" alt="XyloNet" className="w-8 h-8 object-contain" />
                  </div>
                </div>
                <div>
                  <span className="text-xl font-bold text-white">XyloNet</span>
                  <div className="text-xs text-gray-500">on Arc Network</div>
                </div>
              </div>
              
              <p className="text-sm text-gray-400 mb-6 max-w-xs leading-relaxed">
                The Stablecoin SuperExchange — swap, bridge, and earn with USDC and EURC on Circle&apos;s Layer 1 blockchain.
              </p>
              
              {/* Social links */}
              <div className="flex items-center gap-3">
                <a
                  href="https://x.com/Xylonet_"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:border-white/20 transition-all duration-300"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-[#0A786A]/20 to-[#01C38E]/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <svg viewBox="0 0 24 24" className="relative w-4 h-4" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </a>
                
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-gray-600 cursor-not-allowed">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                  </svg>
                </div>
                
                <a
                  href="https://discord.gg/mcDkHNrFyA"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:border-white/20 transition-all duration-300"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-[#5865F2]/20 to-[#7289da]/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <svg className="relative w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* Products */}
            <div className="col-span-1 md:col-span-2">
              <h4 className="font-semibold text-white mb-4 text-sm tracking-wide">Products</h4>
              <ul className="space-y-3">
                {footerLinks.products.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className={`group flex items-center gap-2 transition-colors duration-200 ${
                        link.featured 
                          ? 'text-[#01C38E] hover:text-[#01C38E]' 
                          : 'text-gray-400 hover:text-white'
                      }`}
                      onMouseEnter={() => setHoveredLink(link.name)}
                      onMouseLeave={() => setHoveredLink(null)}
                    >
                      <span className={`w-1 h-1 rounded-full transition-all duration-200 ${
                        link.featured
                          ? 'bg-[#01C38E]'
                          : hoveredLink === link.name ? 'bg-[#01C38E] scale-150' : 'bg-gray-600'
                      }`} />
                      <span className="text-sm">{link.name}</span>
                      {link.featured && (
                        <span className="text-[10px] px-1.5 py-0.5 bg-[#01C38E]/20 border border-[#01C38E]/30 rounded text-[#01C38E] font-medium">NEW</span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Resources */}
            <div className="col-span-1 md:col-span-2">
              <h4 className="font-semibold text-white mb-4 text-sm tracking-wide">Resources</h4>
              <ul className="space-y-3">
                {footerLinks.resources.map((link) => (
                  <li key={link.name}>
                    {link.disabled ? (
                      <span className="flex items-center gap-2 text-gray-600 cursor-not-allowed text-sm">
                        <span className="w-1 h-1 rounded-full bg-gray-700" />
                        {link.name}
                        <span className="text-[10px] px-1.5 py-0.5 bg-white/5 rounded text-gray-600">Soon</span>
                      </span>
                    ) : link.external ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-center gap-2 text-gray-400 hover:text-white transition-colors duration-200"
                        onMouseEnter={() => setHoveredLink(link.name)}
                        onMouseLeave={() => setHoveredLink(null)}
                      >
                        <span className={`w-1 h-1 rounded-full transition-all duration-200 ${
                          hoveredLink === link.name ? 'bg-[#01C38E] scale-150' : 'bg-gray-600'
                        }`} />
                        <span className="text-sm">{link.name}</span>
                        <svg className="w-3 h-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        className="group flex items-center gap-2 text-gray-400 hover:text-white transition-colors duration-200"
                        onMouseEnter={() => setHoveredLink(link.name)}
                        onMouseLeave={() => setHoveredLink(null)}
                      >
                        <span className={`w-1 h-1 rounded-full transition-all duration-200 ${
                          hoveredLink === link.name ? 'bg-[#01C38E] scale-150' : 'bg-gray-600'
                        }`} />
                        <span className="text-sm">{link.name}</span>
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            {/* Network Status */}
            <div className="col-span-2 md:col-span-4">
              <h4 className="font-semibold text-white mb-4 text-sm tracking-wide">Network</h4>
              
              <div className="space-y-3">
                {/* Arc Testnet Status */}
                <div className="flex items-center justify-between p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                  <div className="flex items-center gap-3">
                    <img src="/chains/arc.png" alt="Arc" className="w-6 h-6" />
                    <div>
                      <div className="text-sm text-white font-medium">Arc Testnet</div>
                      <div className="text-xs text-gray-500">Chain ID: 5042002</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-[#01C38E] rounded-full animate-pulse" />
                    <span className="text-xs text-[#01C38E]">Live</span>
                  </div>
                </div>
                
                {/* Quick stats */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl text-center">
                    <div className="text-lg font-bold text-white">&lt;350ms</div>
                    <div className="text-xs text-gray-500">Finality</div>
                  </div>
                  <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl text-center">
                    <div className="text-lg font-bold text-white">~$0.01</div>
                    <div className="text-xs text-gray-500">Per Tx</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="py-6 border-t border-white/5">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span>© {currentYear} XyloNet</span>
              <span className="w-1 h-1 rounded-full bg-gray-700" />
              <span>All rights reserved</span>
            </div>
            
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-600">Built by</span>
              <span className="text-xs text-gray-400 font-medium">ForgeLabs</span>
              <span className="text-xs text-gray-600">for</span>
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#01C38E]/10 border border-[#01C38E]/20 rounded-full">
                <img src="/chains/arc.png" alt="Arc" className="w-3.5 h-3.5" />
                <span className="text-xs text-[#01C38E] font-medium">Arc</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
