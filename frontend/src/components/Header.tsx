'use client'

import { ConnectButton } from '@rainbow-me/rainbowkit'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { Menu, X, Zap } from 'lucide-react'
import { useAccount } from 'wagmi'
import { cn } from '@/lib/utils'

const navLinks: Array<{ href: string; label: string }> = [
  { href: '/swap', label: 'Swap' },
  { href: '/pools', label: 'Pools' },
  { href: '/bridge', label: 'Bridge' },
  { href: '/vault', label: 'Vault' },
  { href: '/faucet', label: 'Faucet' },
  { href: '/history', label: 'History' },
]

// Special highlighted links
const payxLink = { href: '/payx', label: 'PayX' }
const facilitatorLink = { href: '/xylofacilitator', label: 'Facilitator' }
const pointsLink = { href: '/points', label: 'Points' }

export function Header() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { isConnected } = useAccount()

  // Don't render global header on PayX pages - they have their own navigation
  if (pathname?.startsWith('/payx')) {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[var(--card-border)] bg-[var(--background)]/95 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto flex h-14 sm:h-16 items-center justify-between px-3 sm:px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-1.5 sm:gap-2 group flex-shrink-0">
          <div className="relative flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg overflow-hidden transition-transform group-hover:scale-105">
            {/* XyloNet Gradient Logo */}
            <Image
              src="/branding/xylonet-gradient.svg"
              alt="XyloNet"
              width={32}
              height={32}
              className="object-contain"
              priority
            />
          </div>
          <span className="text-base sm:text-lg font-semibold bg-gradient-to-r from-[#132D46] via-[#0A786A] to-[#01C38E] bg-clip-text text-transparent">
            XyloNet
          </span>
        </Link>
        
        {/* Home Link - only show on app pages */}
        {pathname !== '/' && pathname !== '/swap' && (
          <Link href="/" className="ml-4 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
            ← Home
          </Link>
        )}

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                pathname === link.href
                  ? 'bg-[var(--primary)] text-white'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              )}
            >
              {link.label}
            </Link>
          ))}
          
          {/* PayX Button - Teal accent styling */}
          <Link
            href={payxLink.href}
            className={cn(
              'ml-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 relative',
              pathname === payxLink.href || pathname?.startsWith('/payx')
                ? 'bg-[#01C38E] text-white shadow-lg shadow-[#01C38E]/25'
                : 'bg-[#01C38E]/10 text-[#01C38E] border border-[#01C38E]/30 hover:bg-[#01C38E] hover:text-white hover:shadow-lg hover:shadow-[#01C38E]/25'
            )}
          >
            {payxLink.label}
            <span className="absolute -top-1 -right-1 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#01C38E] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#01C38E]"></span>
            </span>
          </Link>
          
          {/* Facilitator Button - Teal accent styling */}
          <Link
            href={facilitatorLink.href}
            className={cn(
              'ml-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 relative',
              pathname === facilitatorLink.href || pathname?.startsWith('/xylofacilitator')
                ? 'bg-[#01C38E] text-white shadow-lg shadow-[#01C38E]/25'
                : 'bg-[#01C38E]/10 text-[#01C38E] border border-[#01C38E]/30 hover:bg-[#01C38E] hover:text-white hover:shadow-lg hover:shadow-[#01C38E]/25'
            )}
          >
            {facilitatorLink.label}
            <span className="absolute -top-1 -right-1 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#01C38E] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#01C38E]"></span>
            </span>
          </Link>
          
          {/* Points Button - Slate/teal styling */}
          <Link
            href={pointsLink.href}
            className={cn(
              'ml-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 relative',
              pathname === pointsLink.href
                ? 'bg-[#0A786A] text-white shadow-lg shadow-[#0A786A]/25'
                : 'bg-slate-700/50 text-slate-300 border border-slate-600 hover:bg-[#0A786A] hover:text-white hover:border-[#0A786A] hover:shadow-lg hover:shadow-[#0A786A]/25'
            )}
          >
            {pointsLink.label}
            <span className="absolute -top-1 -right-1 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#01C38E] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#01C38E]"></span>
            </span>
          </Link>
        </nav>

        {/* Right Section */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Network Status - Only show when connected */}
          {isConnected && (
            <div className="hidden sm:flex network-status">
              <div className="network-status-dot connected" />
              <span className="text-[var(--text-secondary)]">Arc</span>
              <Zap className="w-3 h-3 text-[var(--success)]" />
            </div>
          )}
          
          {/* Connect Button */}
          <div className="[&_button]:!px-2 [&_button]:!py-1.5 sm:[&_button]:!px-3 sm:[&_button]:!py-2 [&_button]:!text-sm [&_button]:!min-h-[36px] sm:[&_button]:!min-h-[40px]">
            <ConnectButton 
              showBalance={false}
              chainStatus="icon"
              accountStatus={{ smallScreen: 'avatar', largeScreen: 'address' }}
            />
          </div>
          
          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-[var(--card-border)] transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5 text-[var(--text-primary)]" /> : <Menu className="w-5 h-5 text-[var(--text-primary)]" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[var(--card-border)] bg-[var(--background)] animate-slide-up">
          <nav className="max-w-7xl mx-auto px-3 py-2 space-y-1 safe-area-bottom">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  'flex items-center px-4 py-3 rounded-lg text-base font-medium transition-all min-h-[48px] relative',
                  pathname === link.href
                    ? 'bg-[var(--primary)] text-white'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--card-border)] active:bg-[var(--card-border)]'
                )}
              >
                {link.label}
              </Link>
            ))}
            
            {/* PayX Button - Teal styling on mobile */}
            <Link
              href={payxLink.href}
              onClick={() => setMobileMenuOpen(false)}
              className={cn(
                'flex items-center px-4 py-3 rounded-lg text-base font-semibold transition-all min-h-[48px] relative mt-2',
                pathname === payxLink.href || pathname?.startsWith('/payx')
                  ? 'bg-[#01C38E] text-white'
                  : 'bg-[#01C38E]/10 text-[#01C38E] border border-[#01C38E]/30'
              )}
            >
              {payxLink.label}
              <span className="ml-2 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-[#01C38E] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#01C38E]"></span>
              </span>
            </Link>
            
            {/* Facilitator Button - Teal styling on mobile */}
            <Link
              href={facilitatorLink.href}
              onClick={() => setMobileMenuOpen(false)}
              className={cn(
                'flex items-center px-4 py-3 rounded-lg text-base font-semibold transition-all min-h-[48px] relative mt-2',
                pathname === facilitatorLink.href || pathname?.startsWith('/xylofacilitator')
                  ? 'bg-[#01C38E] text-white'
                  : 'bg-[#01C38E]/10 text-[#01C38E] border border-[#01C38E]/30'
              )}
            >
              {facilitatorLink.label}
              <span className="ml-2 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-[#01C38E] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#01C38E]"></span>
              </span>
            </Link>
            
            {/* Points Button - Slate/teal styling on mobile */}
            <Link
              href={pointsLink.href}
              onClick={() => setMobileMenuOpen(false)}
              className={cn(
                'flex items-center px-4 py-3 rounded-lg text-base font-semibold transition-all min-h-[48px] relative mt-2',
                pathname === pointsLink.href
                  ? 'bg-[#0A786A] text-white'
                  : 'bg-slate-700/50 text-slate-300 border border-slate-600'
              )}
            >
              {pointsLink.label}
              <span className="ml-2 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-[#01C38E] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#01C38E]"></span>
              </span>
            </Link>
            
            {/* Network status on mobile */}
            {isConnected && (
              <div className="flex items-center gap-2 px-4 py-3 text-sm text-[var(--text-secondary)]">
                <div className="w-2 h-2 rounded-full bg-[var(--success)] animate-pulse" />
                <span>Connected to Arc Testnet</span>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}
