'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navigation = [
  {
    title: 'Getting Started',
    items: [
      { name: 'Introduction', href: '/docs' },
      { name: 'Quick Start', href: '/docs/quickstart' },
      { name: 'Network Setup', href: '/docs/network' },
    ],
  },
  {
    title: 'Products',
    items: [
      { name: 'Swap', href: '/docs/swap' },
      { name: 'Bridge', href: '/docs/bridge' },
      { name: 'Liquidity Pools', href: '/docs/pools' },
      { name: 'Vault', href: '/docs/vault' },
    ],
  },
  {
    title: 'Technical',
    items: [
      { name: 'Architecture', href: '/docs/architecture' },
      { name: 'Smart Contracts', href: '/docs/contracts' },
      { name: 'Integration Guide', href: '/docs/integration' },
    ],
  },
  {
    title: 'Resources',
    items: [
      { name: 'Security', href: '/docs/security' },
      { name: 'FAQ', href: '/docs/faq' },
    ],
  },
];

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(docHeight > 0 ? (scrollTop / docHeight) * 100 : 0);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#0f172a]">
      {/* Progress bar */}
      <div className="fixed top-0 left-0 right-0 h-0.5 bg-white/5 z-[60]">
        <div
          className="h-full bg-gradient-to-r from-[#132D46] via-[#0A786A] to-[#01C38E]"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#0f172a]/95 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="relative">
                <div className="relative w-9 h-9 rounded-lg bg-[#1e293b] border border-white/10 flex items-center justify-center overflow-hidden">
                  <img src="/branding/xylonet-gradient.svg" alt="XyloNet" className="w-6 h-6" />
                </div>
              </div>
              <span className="text-lg font-bold text-white">XyloNet</span>
            </Link>
            <div className="hidden sm:flex items-center">
              <span className="text-gray-600">/</span>
              <span className="ml-2 text-gray-400 font-medium">Documentation</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="https://testnet.arcscan.app"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-400 hover:text-white transition-colors"
            >
              Explorer
              <svg className="w-3.5 h-3.5 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
            <a
              href="https://github.com/Panchu11/xylonet-public"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-400 hover:text-white transition-colors"
            >
              GitHub
              <svg className="w-3.5 h-3.5 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
            <Link
              href="/swap"
              className="px-4 py-2 bg-gradient-to-r from-[#0A786A] to-[#01C38E] rounded-lg text-sm font-semibold text-white hover:shadow-lg hover:shadow-[#01C38E]/20 transition-all"
            >
              Launch App
            </Link>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 hover:bg-white/5 rounded-lg"
            >
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-[1600px] mx-auto flex">
        {/* Sidebar - Desktop */}
        <aside className="hidden lg:block w-64 shrink-0 border-r border-white/5">
          <nav className="sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto py-8 px-4">
            {navigation.map((group) => (
              <div key={group.title} className="mb-6">
                <h4 className="px-3 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {group.title}
                </h4>
                <ul className="space-y-1">
                  {group.items.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={`block px-3 py-2 rounded-lg text-sm transition-all ${
                          pathname === item.href
                            ? 'bg-[#01C38E]/10 text-[#01C38E] font-medium'
                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            {/* Quick Links */}
            <div className="mt-8 pt-6 border-t border-white/5">
              <h4 className="px-3 mb-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Quick Links
              </h4>
              <div className="space-y-1">
                <a
                  href="https://faucet.circle.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-2 text-sm text-gray-400 hover:text-white transition-colors"
                >
                  <span>🚰</span> Get Testnet USDC
                </a>
                <a
                  href="https://discord.gg/mcDkHNrFyA"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-2 text-sm text-gray-400 hover:text-white transition-colors"
                >
                  <span>💬</span> Discord
                </a>
                <a
                  href="https://x.com/Xylonet_"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-2 text-sm text-gray-400 hover:text-white transition-colors"
                >
                  <span>𝕏</span> Twitter
                </a>
              </div>
            </div>
          </nav>
        </aside>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div className="absolute inset-0 bg-black/80" onClick={() => setIsMobileMenuOpen(false)} />
            <div className="absolute left-0 top-0 bottom-0 w-72 bg-[#1e293b] border-r border-white/5 overflow-y-auto">
              <div className="p-4 border-b border-white/5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-white">Menu</span>
                  <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 hover:bg-white/5 rounded-lg">
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              <nav className="p-4">
                {navigation.map((group) => (
                  <div key={group.title} className="mb-6">
                    <h4 className="px-3 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      {group.title}
                    </h4>
                    <ul className="space-y-1">
                      {group.items.map((item) => (
                        <li key={item.href}>
                          <Link
                            href={item.href}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className={`block px-3 py-2.5 rounded-lg text-sm ${
                              pathname === item.href
                                ? 'bg-[#01C38E]/10 text-[#01C38E] font-medium'
                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                            }`}
                          >
                            {item.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </nav>
            </div>
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          <div className="max-w-4xl mx-auto px-6 py-10">
            {children}
          </div>
        </main>

        {/* Right sidebar - Table of Contents placeholder */}
        <aside className="hidden xl:block w-56 shrink-0">
          <div className="sticky top-14 h-[calc(100vh-3.5rem)] py-8 px-4">
            {/* TOC will be page-specific */}
          </div>
        </aside>
      </div>
    </div>
  );
}
