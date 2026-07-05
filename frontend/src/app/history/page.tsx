'use client'

import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { formatUnits } from 'viem'
import { ArrowRight, ArrowUpDown, Download, Upload, RefreshCw, ExternalLink, Clock, Trash2, History } from 'lucide-react'
import Link from 'next/link'
import { CONTRACTS, ARC_NETWORK } from '@/config/constants'
import { TokenLogo } from '@/components/ui/TokenLogos'
import { SkeletonTable } from '@/components/ui/Skeleton'
import { cn, formatNumber } from '@/lib/utils'
import { Transaction, loadTransactions, clearTransactions } from '@/lib/transactions'
import { NoTransactionsEmptyState, WalletNotConnectedEmptyState } from '@/components/ui/EmptyState'

// Token address to symbol mapping
const TOKEN_MAP: Record<string, string> = {
  [CONTRACTS.USDC.toLowerCase()]: 'USDC',
  [CONTRACTS.EURC.toLowerCase()]: 'EURC',
  [CONTRACTS.USYC.toLowerCase()]: 'USYC',
}

export default function HistoryPage() {
  const { address, isConnected } = useAccount()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'swap' | 'liquidity' | 'vault' | 'bridge'>('all')
  const [mousePosition, setMousePosition] = useState({ x: 0.5, y: 0.5 })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
      })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  const handleLoadTransactions = () => {
    const localTxs = loadTransactions()
    setTransactions(localTxs)
    setIsLoading(false)
  }

  const handleClearHistory = () => {
    clearTransactions()
    setTransactions([])
  }

  useEffect(() => {
    if (!address) {
      setTransactions([])
      setIsLoading(false)
      return
    }

    handleLoadTransactions()

    // Also try to fetch from Blockscout API and merge
    const fetchFromBlockscout = async () => {
      try {
        const response = await fetch(
          `https://testnet.arcscan.app/api/v2/addresses/${address}/transactions?filter=to%7Cfrom`
        )
        
        if (response.ok) {
          const data = await response.json()
          const apiTxs: Transaction[] = []
          
          for (const tx of data.items || []) {
            const toAddr = tx.to?.hash?.toLowerCase()
            const method = tx.method || ''
            
            let txType: Transaction['type'] | null = null
            let tokenIn = '', tokenOut = '', amountIn = '', amountOut = ''
            
            // Match against XyloNet contracts
            if (toAddr === CONTRACTS.ROUTER.toLowerCase()) {
              if (method.includes('swap')) {
                txType = 'swap'
                if (tx.decoded_input?.parameters) {
                  const params = tx.decoded_input.parameters
                  tokenIn = TOKEN_MAP[params[0]?.value?.toLowerCase()] || 'Unknown'
                  tokenOut = TOKEN_MAP[params[1]?.value?.toLowerCase()] || 'Unknown'
                  amountIn = formatUnits(BigInt(params[2]?.value || '0'), 6)
                }
              } else if (method.includes('addLiquidity')) {
                txType = 'add_liquidity'
              } else if (method.includes('removeLiquidity')) {
                txType = 'remove_liquidity'
              }
            } else if (toAddr === CONTRACTS.VAULT.toLowerCase()) {
              if (method.includes('deposit')) {
                txType = 'deposit'
                amountIn = formatUnits(BigInt(tx.value || '0'), 6)
              } else if (method.includes('withdraw')) {
                txType = 'withdraw'
              }
            } else if (toAddr === CONTRACTS.BRIDGE.toLowerCase()) {
              txType = 'bridge'
            } else if (toAddr === CONTRACTS.USDC_EURC_POOL.toLowerCase() || toAddr === CONTRACTS.USDC_USYC_POOL.toLowerCase()) {
              if (method.includes('addLiquidity')) {
                txType = 'add_liquidity'
              } else if (method.includes('removeLiquidity')) {
                txType = 'remove_liquidity'
              }
            }
            
            if (txType) {
              apiTxs.push({
                hash: tx.hash,
                type: txType,
                timestamp: new Date(tx.timestamp).getTime(),
                tokenIn,
                tokenOut,
                amountIn,
                amountOut,
                status: tx.status === 'ok' ? 'success' : tx.status === 'error' ? 'failed' : 'pending',
              })
            }
          }
          
          // Merge API transactions with local ones (avoid duplicates)
          if (apiTxs.length > 0) {
            setTransactions(prev => {
              const existingHashes = new Set(prev.map(t => t.hash))
              const newTxs = apiTxs.filter(t => !existingHashes.has(t.hash))
              return [...newTxs, ...prev].sort((a, b) => b.timestamp - a.timestamp).slice(0, 50)
            })
          }
        }
      } catch (error) {
        console.error('Failed to fetch from Blockscout:', error)
      }
    }

    fetchFromBlockscout()
  }, [address])

  const filteredTransactions = transactions.filter((tx) => {
    if (filter === 'all') return true
    if (filter === 'swap') return tx.type === 'swap'
    if (filter === 'liquidity') return tx.type === 'add_liquidity' || tx.type === 'remove_liquidity'
    if (filter === 'vault') return tx.type === 'deposit' || tx.type === 'withdraw'
    if (filter === 'bridge') return tx.type === 'bridge'
    return true
  })

  const getTypeIcon = (type: Transaction['type']) => {
    switch (type) {
      case 'swap':
        return <ArrowUpDown className="w-4 h-4" />
      case 'add_liquidity':
        return <Download className="w-4 h-4" />
      case 'remove_liquidity':
        return <Upload className="w-4 h-4" />
      case 'deposit':
        return <Download className="w-4 h-4" />
      case 'withdraw':
        return <Upload className="w-4 h-4" />
      case 'bridge':
        return <ArrowRight className="w-4 h-4" />
      case 'approve':
        return <RefreshCw className="w-4 h-4" />
    }
  }

  const getTypeLabel = (type: Transaction['type']) => {
    switch (type) {
      case 'swap':
        return 'Swap'
      case 'add_liquidity':
        return 'Add Liquidity'
      case 'remove_liquidity':
        return 'Remove Liquidity'
      case 'deposit':
        return 'Vault Deposit'
      case 'withdraw':
        return 'Vault Withdraw'
      case 'bridge':
        return 'Bridge'
      case 'approve':
        return 'Approve'
    }
  }

  const getTypeColor = (type: Transaction['type']) => {
    switch (type) {
      case 'swap':
        return 'bg-[#01C38E]/20 text-[#01C38E]'
      case 'add_liquidity':
        return 'bg-[#0A786A]/20 text-[#01C38E]'
      case 'remove_liquidity':
        return 'bg-orange-500/20 text-orange-400'
      case 'deposit':
        return 'bg-blue-500/20 text-blue-400'
      case 'withdraw':
        return 'bg-amber-500/20 text-amber-400'
      case 'bridge':
        return 'bg-[#0A786A]/20 text-[#0A786A]'
      case 'approve':
        return 'bg-gray-500/20 text-gray-400'
    }
  }

  const formatTime = (timestamp: number) => {
    const now = Date.now()
    const diff = now - timestamp
    
    if (diff < 60000) return 'Just now'
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
    return new Date(timestamp).toLocaleDateString()
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] px-3 sm:px-4 py-6 sm:py-12 relative overflow-hidden">
      {/* Cinematic Background */}
      <div className="absolute inset-0 bg-[#0f172a]">
        <div 
          className="absolute w-[1000px] h-[1000px] rounded-full opacity-20 blur-[150px] transition-all duration-700"
          style={{
            background: 'radial-gradient(circle, rgba(1,195,142,0.8) 0%, rgba(10,120,106,0.4) 50%, transparent 70%)',
            top: `calc(${mousePosition.y * 100}% - 500px)`,
            left: `calc(${mousePosition.x * 100}% - 500px)`,
          }}
        />
        <div 
          className="absolute w-[800px] h-[800px] rounded-full opacity-15 blur-[120px] transition-all duration-1000"
          style={{
            background: 'radial-gradient(circle, rgba(1,195,142,0.6) 0%, rgba(10,120,106,0.3) 60%, transparent 70%)',
            bottom: `calc(${(1-mousePosition.y) * 80}% - 400px)`,
            right: `calc(${(1-mousePosition.x) * 80}% - 400px)`,
          }}
        />
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }} />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col gap-4 mb-6 sm:mb-8 animate-fade-in-up">
          <div>
            <div className="inline-flex items-center gap-2 glass-premium border border-[#01C38E]/20 rounded-full px-4 py-2 mb-4 magnetic-hover">
              <History className="w-4 h-4 text-[#01C38E]" />
              <span className="text-[#01C38E] font-medium text-sm">Transaction Explorer</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold mb-2">
              <span className="relative inline-block">
                <span className="relative z-10 bg-gradient-to-r from-[#132D46] via-[#0A786A] to-[#01C38E] text-transparent bg-clip-text">
                  Transaction History
                </span>
                <div className="absolute -bottom-1 left-0 right-0 h-1 bg-gradient-to-r from-[#132D46] via-[#0A786A] to-[#01C38E] rounded-full blur-sm opacity-50" />
              </span>
            </h1>
            <p className="text-gray-400 text-sm sm:text-base">
              Track all your <span className="text-[#01C38E] font-semibold">swaps</span>,{' '}
              <span className="text-[#0A786A] font-semibold">liquidity</span>, and{' '}
              <span className="text-[#01C38E] font-semibold">vault</span> transactions
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => window.location.reload()}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-[var(--card-border)] hover:bg-[var(--card-bg)] rounded-lg transition-colors text-sm min-h-[40px]"
            >
              <RefreshCw className="w-4 h-4" />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            {transactions.length > 0 && (
              <button
                onClick={handleClearHistory}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors text-sm min-h-[40px]"
              >
                <Trash2 className="w-4 h-4" />
                <span className="hidden sm:inline">Clear</span>
              </button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-4 sm:mb-6 overflow-x-auto pb-2 -mx-1 px-1">
          {(['all', 'swap', 'liquidity', 'vault', 'bridge'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                'px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap min-h-[40px]',
                filter === f
                  ? 'bg-[var(--primary)] text-white'
                  : 'bg-[var(--card-border)] text-[var(--text-secondary)] hover:bg-[var(--card-bg)] hover:text-[var(--text-primary)]'
              )}
            >
              {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* Content */}
        {!isConnected ? (
          <div className="bg-[var(--card-bg)] rounded-xl border border-[var(--card-border)]">
            <WalletNotConnectedEmptyState />
          </div>
        ) : isLoading ? (
          <SkeletonTable />
        ) : filteredTransactions.length === 0 ? (
          <div className="bg-[var(--card-bg)] rounded-xl border border-[var(--card-border)]">
            {filter === 'all' ? (
              <div className="empty-state">
                <div className="empty-state-icon">
                  <History className="w-10 h-10 text-[var(--text-muted)]" />
                </div>
                <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-2">No Transactions Yet</h3>
                <p className="text-[var(--text-secondary)] max-w-sm mb-6">
                  Your transaction history will appear here once you start swapping, providing liquidity, or using the vault.
                </p>
                <Link
                  href="/"
                  className="px-6 py-3 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white rounded-lg font-semibold transition-all"
                >
                  Make Your First Swap
                </Link>
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-state-icon">
                  <Clock className="w-10 h-10 text-[var(--text-muted)]" />
                </div>
                <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-2">No {filter.charAt(0).toUpperCase() + filter.slice(1)} Transactions</h3>
                <p className="text-[var(--text-secondary)]">
                  No {filter} transactions found. Try a different filter.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-[var(--card-bg)] rounded-xl border border-[var(--card-border)] overflow-hidden">
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[var(--card-border)]">
                    <th className="text-left text-sm font-medium text-[var(--text-secondary)] px-6 py-4">Type</th>
                    <th className="text-left text-sm font-medium text-[var(--text-secondary)] px-6 py-4">Details</th>
                    <th className="text-left text-sm font-medium text-[var(--text-secondary)] px-6 py-4">Status</th>
                    <th className="text-left text-sm font-medium text-[var(--text-secondary)] px-6 py-4">Time</th>
                    <th className="text-right text-sm font-medium text-[var(--text-secondary)] px-6 py-4">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--card-border)]">
                  {filteredTransactions.map((tx) => (
                    <tr key={tx.hash} className="hover:bg-[var(--card-border)] transition-colors">
                      <td className="px-6 py-4">
                        <div className={cn(
                          'inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm',
                          getTypeColor(tx.type)
                        )}>
                          {getTypeIcon(tx.type)}
                          {getTypeLabel(tx.type)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {tx.type === 'swap' && tx.tokenIn && tx.tokenOut ? (
                          <div className="flex items-center gap-2">
                            <TokenLogo symbol={tx.tokenIn} size={20} />
                            <span className="text-[var(--text-primary)]">{tx.amountIn ? formatNumber(tx.amountIn, 2) : '?'} {tx.tokenIn}</span>
                            <ArrowRight className="w-4 h-4 text-[var(--text-muted)]" />
                            <TokenLogo symbol={tx.tokenOut} size={20} />
                            <span className="text-[var(--text-primary)]">{tx.tokenOut}</span>
                          </div>
                        ) : (
                          <span className="text-[var(--text-secondary)]">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          'inline-flex items-center gap-1 text-sm',
                          tx.status === 'success' ? 'text-[var(--success)]' :
                          tx.status === 'pending' ? 'text-[var(--warning)]' : 'text-[var(--error)]'
                        )}>
                          <span className={cn(
                            'w-2 h-2 rounded-full',
                            tx.status === 'success' ? 'bg-[var(--success)]' :
                            tx.status === 'pending' ? 'bg-[var(--warning)] animate-pulse' : 'bg-[var(--error)]'
                          )} />
                          {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-[var(--text-secondary)]">
                        {formatTime(tx.timestamp)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <a
                          href={`${ARC_NETWORK.explorer}/tx/${tx.hash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-sm text-[var(--primary)] hover:text-[var(--primary-hover)]"
                        >
                          View
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card List */}
            <div className="md:hidden divide-y divide-[var(--card-border)]">
              {filteredTransactions.map((tx) => (
                <div key={tx.hash} className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className={cn(
                      'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs',
                      getTypeColor(tx.type)
                    )}>
                      {getTypeIcon(tx.type)}
                      {getTypeLabel(tx.type)}
                    </div>
                    <span className={cn(
                      'inline-flex items-center gap-1 text-xs',
                      tx.status === 'success' ? 'text-[var(--success)]' :
                      tx.status === 'pending' ? 'text-[var(--warning)]' : 'text-[var(--error)]'
                    )}>
                      <span className={cn(
                        'w-1.5 h-1.5 rounded-full',
                        tx.status === 'success' ? 'bg-[var(--success)]' :
                        tx.status === 'pending' ? 'bg-[var(--warning)] animate-pulse' : 'bg-[var(--error)]'
                      )} />
                      {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                    </span>
                  </div>
                  
                  {tx.type === 'swap' && tx.tokenIn && tx.tokenOut && (
                    <div className="flex items-center gap-2 mb-3 text-sm">
                      <TokenLogo symbol={tx.tokenIn} size={18} />
                      <span className="text-[var(--text-primary)]">{tx.amountIn ? formatNumber(tx.amountIn, 2) : '?'} {tx.tokenIn}</span>
                      <ArrowRight className="w-3 h-3 text-[var(--text-muted)]" />
                      <TokenLogo symbol={tx.tokenOut} size={18} />
                      <span className="text-[var(--text-primary)]">{tx.tokenOut}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[var(--text-secondary)]">
                      {formatTime(tx.timestamp)}
                    </span>
                    <a
                      href={`${ARC_NETWORK.explorer}/tx/${tx.hash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-[var(--primary)] hover:text-[var(--primary-hover)] min-h-[36px] px-2"
                    >
                      View
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
