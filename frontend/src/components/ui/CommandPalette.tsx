'use client'

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Search, 
  ArrowRight, 
  Repeat, 
  Droplets, 
  Vault, 
  History, 
  ExternalLink,
  Wallet,
  Command,
  X,
  ArrowUpDown,
  DollarSign
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface CommandItem {
  id: string
  title: string
  description?: string
  icon: React.ReactNode
  action: () => void
  keywords?: string[]
  category: 'navigation' | 'action' | 'external'
}

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const commands: CommandItem[] = useMemo(() => [
    // Navigation
    {
      id: 'nav-swap',
      title: 'Swap Tokens',
      description: 'Exchange stablecoins with minimal slippage',
      icon: <ArrowUpDown className="w-4 h-4" />,
      action: () => { router.push('/'); setIsOpen(false) },
      keywords: ['swap', 'exchange', 'trade', 'home'],
      category: 'navigation',
    },
    {
      id: 'nav-pools',
      title: 'Liquidity Pools',
      description: 'Provide liquidity and earn fees',
      icon: <Droplets className="w-4 h-4" />,
      action: () => { router.push('/pools'); setIsOpen(false) },
      keywords: ['pools', 'liquidity', 'lp', 'provide'],
      category: 'navigation',
    },
    {
      id: 'nav-bridge',
      title: 'Bridge USDC',
      description: 'Transfer USDC across chains via CCTP',
      icon: <ArrowRight className="w-4 h-4" />,
      action: () => { router.push('/bridge'); setIsOpen(false) },
      keywords: ['bridge', 'cross-chain', 'transfer', 'cctp'],
      category: 'navigation',
    },
    {
      id: 'nav-vault',
      title: 'Yield Vault',
      description: 'Deposit USDC to earn yield',
      icon: <Vault className="w-4 h-4" />,
      action: () => { router.push('/vault'); setIsOpen(false) },
      keywords: ['vault', 'yield', 'earn', 'deposit', 'apy'],
      category: 'navigation',
    },
    {
      id: 'nav-history',
      title: 'Transaction History',
      description: 'View past transactions',
      icon: <History className="w-4 h-4" />,
      action: () => { router.push('/history'); setIsOpen(false) },
      keywords: ['history', 'transactions', 'activity'],
      category: 'navigation',
    },
    {
      id: 'nav-facilitator',
      title: 'XyloFacilitator',
      description: 'Monetize APIs with x402 payments',
      icon: <DollarSign className="w-4 h-4" />,
      action: () => { router.push('/xylofacilitator'); setIsOpen(false) },
      keywords: ['facilitator', 'x402', 'payment', 'api', 'monetize'],
      category: 'navigation',
    },
    // External Links
    {
      id: 'ext-explorer',
      title: 'View on Explorer',
      description: 'Open Arc Network block explorer',
      icon: <ExternalLink className="w-4 h-4" />,
      action: () => { window.open('https://testnet.arcscan.app', '_blank'); setIsOpen(false) },
      keywords: ['explorer', 'arcscan', 'block'],
      category: 'external',
    },
    {
      id: 'ext-faucet',
      title: 'Get Test USDC',
      description: 'Get testnet USDC from Circle faucet',
      icon: <Wallet className="w-4 h-4" />,
      action: () => { window.open('https://faucet.circle.com', '_blank'); setIsOpen(false) },
      keywords: ['faucet', 'testnet', 'usdc', 'tokens'],
      category: 'external',
    },
    {
      id: 'ext-docs',
      title: 'Documentation',
      description: 'Read Arc Network docs',
      icon: <ExternalLink className="w-4 h-4" />,
      action: () => { window.open('https://docs.arc.network', '_blank'); setIsOpen(false) },
      keywords: ['docs', 'documentation', 'help'],
      category: 'external',
    },
  ], [router])

  const filteredCommands = useMemo(() => {
    if (!search) return commands

    const searchLower = search.toLowerCase()
    return commands.filter(cmd => {
      const titleMatch = cmd.title.toLowerCase().includes(searchLower)
      const descMatch = cmd.description?.toLowerCase().includes(searchLower)
      const keywordMatch = cmd.keywords?.some(k => k.includes(searchLower))
      return titleMatch || descMatch || keywordMatch
    })
  }, [commands, search])

  const groupedCommands = useMemo(() => {
    const groups: Record<string, CommandItem[]> = {
      navigation: [],
      action: [],
      external: [],
    }

    filteredCommands.forEach(cmd => {
      groups[cmd.category].push(cmd)
    })

    return groups
  }, [filteredCommands])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Open with Ctrl+K or Cmd+K
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsOpen(prev => !prev)
      }

      // Close with Escape
      if (e.key === 'Escape') {
        setIsOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Handle navigation within palette
  const handleKeyNavigation = useCallback((e: React.KeyboardEvent) => {
    const totalItems = filteredCommands.length

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(prev => (prev + 1) % totalItems)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(prev => (prev - 1 + totalItems) % totalItems)
    } else if (e.key === 'Enter') {
      e.preventDefault()
      filteredCommands[selectedIndex]?.action()
    }
  }, [filteredCommands, selectedIndex])

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus()
      setSearch('')
      setSelectedIndex(0)
    }
  }, [isOpen])

  // Reset selection when search changes
  useEffect(() => {
    setSelectedIndex(0)
  }, [search])

  if (!isOpen) {
    // Show keyboard shortcut hint
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-[var(--card-border)] hover:bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg text-sm text-[var(--text-secondary)] transition-colors"
      >
        <Search className="w-4 h-4" />
        <span>Search...</span>
        <kbd className="hidden lg:inline-flex items-center gap-1 px-1.5 py-0.5 bg-[var(--background)] border border-[var(--card-border)] rounded text-xs">
          <Command className="w-3 h-3" />
          <span>K</span>
        </kbd>
      </button>
    )
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={() => setIsOpen(false)}
      />

      {/* Command Palette Modal */}
      <div className="relative w-full max-w-lg mx-4 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl shadow-2xl overflow-hidden animate-scale-in">
        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-[var(--card-border)]">
          <Search className="w-5 h-5 text-[var(--text-muted)]" />
          <input
            ref={inputRef}
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleKeyNavigation}
            placeholder="Search commands..."
            className="flex-1 bg-transparent text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none text-base"
          />
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 hover:bg-[var(--card-border)] rounded transition-colors"
          >
            <X className="w-4 h-4 text-[var(--text-muted)]" />
          </button>
        </div>

        {/* Commands List */}
        <div className="max-h-[60vh] overflow-y-auto">
          {filteredCommands.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-[var(--text-muted)]">No commands found</p>
            </div>
          ) : (
            <>
              {/* Navigation */}
              {groupedCommands.navigation.length > 0 && (
                <div className="p-2">
                  <p className="px-2 py-1 text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
                    Navigate
                  </p>
                  {groupedCommands.navigation.map((cmd, index) => {
                    const globalIndex = filteredCommands.indexOf(cmd)
                    return (
                      <CommandItemComponent
                        key={cmd.id}
                        command={cmd}
                        isSelected={selectedIndex === globalIndex}
                        onSelect={cmd.action}
                        onHover={() => setSelectedIndex(globalIndex)}
                      />
                    )
                  })}
                </div>
              )}

              {/* External */}
              {groupedCommands.external.length > 0 && (
                <div className="p-2 border-t border-[var(--card-border)]">
                  <p className="px-2 py-1 text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
                    External
                  </p>
                  {groupedCommands.external.map((cmd) => {
                    const globalIndex = filteredCommands.indexOf(cmd)
                    return (
                      <CommandItemComponent
                        key={cmd.id}
                        command={cmd}
                        isSelected={selectedIndex === globalIndex}
                        onSelect={cmd.action}
                        onHover={() => setSelectedIndex(globalIndex)}
                      />
                    )
                  })}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-2 border-t border-[var(--card-border)] text-xs text-[var(--text-muted)]">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-[var(--background)] border border-[var(--card-border)] rounded">↑↓</kbd>
              <span>Navigate</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-[var(--background)] border border-[var(--card-border)] rounded">↵</kbd>
              <span>Select</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-[var(--background)] border border-[var(--card-border)] rounded">esc</kbd>
              <span>Close</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

interface CommandItemComponentProps {
  command: CommandItem
  isSelected: boolean
  onSelect: () => void
  onHover: () => void
}

function CommandItemComponent({ command, isSelected, onSelect, onHover }: CommandItemComponentProps) {
  return (
    <button
      onClick={onSelect}
      onMouseEnter={onHover}
      className={cn(
        'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left',
        isSelected
          ? 'bg-[var(--primary)]/20 text-[var(--text-primary)]'
          : 'hover:bg-[var(--card-border)] text-[var(--text-secondary)]'
      )}
    >
      <div className={cn(
        'w-8 h-8 rounded-lg flex items-center justify-center',
        isSelected ? 'bg-[var(--primary)]' : 'bg-[var(--card-border)]'
      )}>
        {command.icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className={cn(
          'font-medium truncate',
          isSelected ? 'text-[var(--text-primary)]' : ''
        )}>
          {command.title}
        </p>
        {command.description && (
          <p className="text-sm text-[var(--text-muted)] truncate">
            {command.description}
          </p>
        )}
      </div>
      {command.category === 'external' && (
        <ExternalLink className="w-4 h-4 text-[var(--text-muted)]" />
      )}
    </button>
  )
}
