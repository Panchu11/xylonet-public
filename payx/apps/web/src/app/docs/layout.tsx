'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

const navigation = [
  {
    title: 'Getting Started',
    items: [
      { name: 'Introduction', href: '/docs' },
      { name: 'Quick Start', href: '/docs/quickstart' },
    ],
  },
  {
    title: 'Features',
    items: [
      { name: 'How Tipping Works', href: '/docs/tipping' },
      { name: 'Claiming Tips', href: '/docs/claiming' },
      { name: 'Chrome Extension', href: '/docs/extension' },
    ],
  },
  {
    title: 'Technical',
    items: [
      { name: 'Smart Contract', href: '/docs/contracts' },
      { name: 'Security', href: '/docs/security' },
    ],
  },
  {
    title: 'Support',
    items: [
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
    <div className="min-h-screen bg-[#030014]">
      {/* Progress bar */}
      <div className="fixed top-0 left-0 right-0 h-0.5 bg-white/5 z-[60]">
        <div
          className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#030014]/95 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg blur opacity-30 group-hover:opacity-50 transition-opacity" />
                <div className="relative w-9 h-9 rounded-lg bg-[#0a0b0f] border border-white/10 flex items-center justify-center overflow-hidden">
                  <Image src="/logo.png" alt="PayX" width={24} height={24} />
                </div>
              </div>
              <span className="text-lg font-bold text-white">PayX</span>
            </Link>
            <div className="hidden sm:flex items-center">
              <span className="text-gray-600">/</span>
              <span className="ml-2 text-gray-400 font-medium">Documentation</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="https://testnet.arcscan.app/address/0xA312c384770B7b49E371DF4b7AF730EFEF465913"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-400 hover:text-white transition-colors"
            >
              Contract
              <svg className="w-3.5 h-3.5 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
            <Link
              href="/claim"
              className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg text-sm font-semibold text-white hover:shadow-lg hover:shadow-indigo-500/20 transition-all"
            >
              Claim Tips
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
                            ? 'bg-indigo-500/10 text-indigo-400 font-medium'
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
                  href="https://chrome.google.com/webstore"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-2 text-sm text-gray-400 hover:text-white transition-colors"
                >
                  <span>🧩</span> Chrome Extension
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

            {/* ForgeLabs Credit */}
            <div className="mt-8 pt-6 border-t border-white/5">
              <div className="px-3 py-3 bg-gradient-to-r from-indigo-500/5 to-purple-500/5 border border-indigo-500/10 rounded-xl">
                <div className="text-xs text-gray-500 mb-1">Built by</div>
                <div className="text-sm font-semibold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                  ForgeLabs
                </div>
              </div>
            </div>
          </nav>
        </aside>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div className="absolute inset-0 bg-black/80" onClick={() => setIsMobileMenuOpen(false)} />
            <div className="absolute left-0 top-0 bottom-0 w-72 bg-[#0a0b0f] border-r border-white/5 overflow-y-auto">
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
                                ? 'bg-indigo-500/10 text-indigo-400 font-medium'
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

        {/* Right sidebar placeholder */}
        <aside className="hidden xl:block w-56 shrink-0">
          <div className="sticky top-14 h-[calc(100vh-3.5rem)] py-8 px-4">
            {/* TOC will be page-specific */}
          </div>
        </aside>
      </div>
    </div>
  );
}
