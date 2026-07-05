'use client'

import { useState, useEffect, useRef } from 'react'
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt, useBalance } from 'wagmi'
import { parseUnits, formatUnits } from 'viem'
import { Plus, TrendingUp, Droplets, Loader2, BarChart3, AlertCircle, Sparkles } from 'lucide-react'
import { TOKENS, CONTRACTS } from '@/config/constants'
import { XYLO_POOL_ABI, ERC20_ABI } from '@/config/abis'
import { cn, formatNumber, formatUSD } from '@/lib/utils'
import { useTxToast } from '@/components/ui/Toast'
import { TokenLogo } from '@/components/ui/TokenLogos'
import { SkeletonPoolCard } from '@/components/ui/Skeleton'
import { InfoTooltip } from '@/components/ui/Tooltip'
import { Confetti } from '@/components/ui/Confetti'
import { Sparkline } from '@/components/ui/EmptyState'
import { TiltCard } from '@/components/ui/TiltCard'
import { saveTransaction } from '@/lib/transactions'

// Pool addresses from deployment
const POOL_ADDRESSES = {
  'USDC-EURC': CONTRACTS.USDC_EURC_POOL,
  'USDC-USYC': CONTRACTS.USDC_USYC_POOL,
}

const ZERO = BigInt(0)

interface TokenInfo {
  address: `0x${string}`
  symbol: string
  name: string
  decimals: number
}

interface PoolData {
  id: string
  address: `0x${string}`
  token0: TokenInfo
  token1: TokenInfo
  reserve0: bigint
  reserve1: bigint
  totalSupply: bigint
  userLpBalance: bigint
}

export default function PoolsPage() {
  const { address, isConnected } = useAccount()
  const { pending, success, error: errorToast } = useTxToast()
  const toastIdRef = useRef<string | null>(null)
  const [showAddLiquidity, setShowAddLiquidity] = useState(false)
  const [showRemoveLiquidity, setShowRemoveLiquidity] = useState(false)
  const [selectedPool, setSelectedPool] = useState<PoolData | null>(null)
  const [amount0, setAmount0] = useState('')
  const [amount1, setAmount1] = useState('')
  const [lpAmount, setLpAmount] = useState('')
  const [needsApproval0, setNeedsApproval0] = useState(false)
  const [needsApproval1, setNeedsApproval1] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const [showConfetti, setShowConfetti] = useState(false)

  // Simulated volume data for sparklines
  const volumeData = [12, 19, 15, 22, 18, 25, 20, 28, 24, 30, 27, 35]

  // Contract writes
  const { writeContract: writeApprove0, data: approve0Hash, isPending: isApproving0 } = useWriteContract()
  const { writeContract: writeApprove1, data: approve1Hash, isPending: isApproving1 } = useWriteContract()
  const { writeContract: writeAddLiquidity, data: addLiqHash, isPending: isAdding } = useWriteContract()
  const { writeContract: writeRemoveLiquidity, data: removeLiqHash, isPending: isRemoving } = useWriteContract()

  // Transaction confirmations
  const { isLoading: isApprove0Confirming, isSuccess: isApprove0Confirmed, isError: isApprove0Error } = useWaitForTransactionReceipt({ hash: approve0Hash })
  const { isLoading: isApprove1Confirming, isSuccess: isApprove1Confirmed, isError: isApprove1Error } = useWaitForTransactionReceipt({ hash: approve1Hash })
  const { isLoading: isAddConfirming, isSuccess: isAddConfirmed, isError: isAddError } = useWaitForTransactionReceipt({ hash: addLiqHash })
  const { isLoading: isRemoveConfirming, isSuccess: isRemoveConfirmed, isError: isRemoveError } = useWaitForTransactionReceipt({ hash: removeLiqHash })

  const isLoading = isApproving0 || isApprove0Confirming || isApproving1 || isApprove1Confirming || isAdding || isAddConfirming || isRemoving || isRemoveConfirming

  // Read USDC-EURC Pool data
  const { data: usdcEurcReserves, refetch: refetchUsdcEurc } = useReadContract({
    address: CONTRACTS.USDC_EURC_POOL,
    abi: XYLO_POOL_ABI,
    functionName: 'getReserves',
  })

  const { data: usdcEurcTotalSupply } = useReadContract({
    address: CONTRACTS.USDC_EURC_POOL,
    abi: XYLO_POOL_ABI,
    functionName: 'totalSupply',
  })

  const { data: usdcEurcUserLp } = useReadContract({
    address: CONTRACTS.USDC_EURC_POOL,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
  })

  // Read USDC-USYC Pool data
  const { data: usdcUsycReserves, refetch: refetchUsdcUsyc } = useReadContract({
    address: CONTRACTS.USDC_USYC_POOL,
    abi: XYLO_POOL_ABI,
    functionName: 'getReserves',
  })

  const { data: usdcUsycTotalSupply } = useReadContract({
    address: CONTRACTS.USDC_USYC_POOL,
    abi: XYLO_POOL_ABI,
    functionName: 'totalSupply',
  })

  const { data: usdcUsycUserLp } = useReadContract({
    address: CONTRACTS.USDC_USYC_POOL,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
  })

  // User token balances
  const { data: usdcBalance } = useBalance({ address, token: TOKENS.USDC.address })
  const { data: eurcBalance } = useBalance({ address, token: TOKENS.EURC.address })
  const { data: usycBalance } = useBalance({ address, token: TOKENS.USYC.address })

  // Check allowances for selected pool
  const { data: allowance0, refetch: refetchAllowance0 } = useReadContract({
    address: selectedPool?.token0.address,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: address && selectedPool ? [address, selectedPool.address] : undefined,
  })

  const { data: allowance1, refetch: refetchAllowance1 } = useReadContract({
    address: selectedPool?.token1.address,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: address && selectedPool ? [address, selectedPool.address] : undefined,
  })

  // Build pools array from real data
  const pools: PoolData[] = [
    {
      id: 'USDC-EURC',
      address: CONTRACTS.USDC_EURC_POOL,
      token0: TOKENS.USDC,
      token1: TOKENS.EURC,
      reserve0: (usdcEurcReserves as [bigint, bigint])?.[0] ?? ZERO,
      reserve1: (usdcEurcReserves as [bigint, bigint])?.[1] ?? ZERO,
      totalSupply: (usdcEurcTotalSupply as bigint) ?? ZERO,
      userLpBalance: (usdcEurcUserLp as bigint) ?? ZERO,
    },
    {
      id: 'USDC-USYC',
      address: CONTRACTS.USDC_USYC_POOL,
      token0: TOKENS.USDC,
      token1: TOKENS.USYC,
      reserve0: (usdcUsycReserves as [bigint, bigint])?.[0] ?? ZERO,
      reserve1: (usdcUsycReserves as [bigint, bigint])?.[1] ?? ZERO,
      totalSupply: (usdcUsycTotalSupply as bigint) ?? ZERO,
      userLpBalance: (usdcUsycUserLp as bigint) ?? ZERO,
    },
  ]

  // Calculate TVL (sum of reserves in USD)
  const calculateTVL = (pool: PoolData) => {
    const r0 = Number(formatUnits(pool.reserve0, pool.token0.decimals))
    const r1 = Number(formatUnits(pool.reserve1, pool.token1.decimals))
    return r0 + r1 // Both are stablecoins, so 1:1 USD value
  }

  const totalTVL = pools.reduce((sum, pool) => sum + calculateTVL(pool), 0)

  // Check approvals when amount changes
  useEffect(() => {
    if (amount0 && selectedPool && allowance0 !== undefined) {
      const amt = parseUnits(amount0 || '0', selectedPool.token0.decimals)
      setNeedsApproval0((allowance0 as bigint) < amt)
    }
  }, [amount0, allowance0, selectedPool])

  useEffect(() => {
    if (amount1 && selectedPool && allowance1 !== undefined) {
      const amt = parseUnits(amount1 || '0', selectedPool.token1.decimals)
      setNeedsApproval1((allowance1 as bigint) < amt)
    }
  }, [amount1, allowance1, selectedPool])

  // Refetch allowances after approval
  useEffect(() => {
    if (isApprove0Confirmed) {
      refetchAllowance0()
      if (toastIdRef.current) {
        success(toastIdRef.current, 'Approval Successful!')
        toastIdRef.current = null
      }
    }
  }, [isApprove0Confirmed, refetchAllowance0, success])

  useEffect(() => {
    if (isApprove1Confirmed) {
      refetchAllowance1()
      if (toastIdRef.current) {
        success(toastIdRef.current, 'Approval Successful!')
        toastIdRef.current = null
      }
    }
  }, [isApprove1Confirmed, refetchAllowance1, success])

  // Handle errors
  useEffect(() => {
    if (isApprove0Error && toastIdRef.current) {
      errorToast(toastIdRef.current, 'Approval Failed', 'Transaction was rejected')
      toastIdRef.current = null
    }
  }, [isApprove0Error, errorToast])

  useEffect(() => {
    if (isAddError && toastIdRef.current) {
      errorToast(toastIdRef.current, 'Add Liquidity Failed', 'Transaction was rejected or failed')
      toastIdRef.current = null
      setErrorMsg('Add liquidity failed. Please try again.')
    }
  }, [isAddError, errorToast])

  useEffect(() => {
    if (isRemoveError && toastIdRef.current) {
      errorToast(toastIdRef.current, 'Remove Liquidity Failed', 'Transaction was rejected')
      toastIdRef.current = null
    }
  }, [isRemoveError, errorToast])

  // Mark initial loading as done
  useEffect(() => {
    if (usdcEurcReserves !== undefined || usdcUsycReserves !== undefined) {
      setIsInitialLoading(false)
    }
  }, [usdcEurcReserves, usdcUsycReserves])

  // Reset and refetch after successful add/remove
  useEffect(() => {
    if (isAddConfirmed && addLiqHash && selectedPool) {
      if (toastIdRef.current) {
        success(toastIdRef.current, 'Liquidity Added!', addLiqHash)
        toastIdRef.current = null
      }
      // Save to transaction history
      saveTransaction({
        hash: addLiqHash,
        type: 'add_liquidity',
        timestamp: Date.now(),
        tokenIn: `${selectedPool.token0.symbol}/${selectedPool.token1.symbol}`,
        amountIn: `${amount0} + ${amount1}`,
        status: 'success',
      })
      setShowConfetti(true)
      setTimeout(() => setShowConfetti(false), 100)
      setAmount0('')
      setAmount1('')
      setShowAddLiquidity(false)
      setErrorMsg(null)
      refetchUsdcEurc()
      refetchUsdcUsyc()
    }
  }, [isAddConfirmed, addLiqHash, selectedPool, amount0, amount1, refetchUsdcEurc, refetchUsdcUsyc, success])

  useEffect(() => {
    if (isRemoveConfirmed && removeLiqHash && selectedPool) {
      if (toastIdRef.current) {
        success(toastIdRef.current, 'Liquidity Removed!', removeLiqHash)
        toastIdRef.current = null
      }
      // Save to transaction history
      saveTransaction({
        hash: removeLiqHash,
        type: 'remove_liquidity',
        timestamp: Date.now(),
        tokenOut: `${selectedPool.token0.symbol}/${selectedPool.token1.symbol}`,
        amountOut: lpAmount,
        status: 'success',
      })
      setLpAmount('')
      setShowRemoveLiquidity(false)
      refetchUsdcEurc()
      refetchUsdcUsyc()
    }
  }, [isRemoveConfirmed, removeLiqHash, selectedPool, lpAmount, refetchUsdcEurc, refetchUsdcUsyc, success])

  const handleApprove0 = () => {
    if (!selectedPool || !amount0) return
    toastIdRef.current = pending(`Approving ${selectedPool.token0.symbol}...`, 'Please confirm in your wallet')
    writeApprove0({
      address: selectedPool.token0.address,
      abi: ERC20_ABI,
      functionName: 'approve',
      args: [selectedPool.address, parseUnits(amount0, selectedPool.token0.decimals)],
    })
  }

  const handleApprove1 = () => {
    if (!selectedPool || !amount1) return
    toastIdRef.current = pending(`Approving ${selectedPool.token1.symbol}...`, 'Please confirm in your wallet')
    writeApprove1({
      address: selectedPool.token1.address,
      abi: ERC20_ABI,
      functionName: 'approve',
      args: [selectedPool.address, parseUnits(amount1, selectedPool.token1.decimals)],
    })
  }

  const handleAddLiquidity = () => {
    if (!selectedPool || !amount0 || !amount1 || !address) return
    const amt0 = parseUnits(amount0, selectedPool.token0.decimals)
    const amt1 = parseUnits(amount1, selectedPool.token1.decimals)
    // Calculate minimum LP tokens (allow 1% slippage)
    const minLpTokens = BigInt(0) // Accept any amount for simplicity
    const deadline = BigInt(Math.floor(Date.now() / 1000) + 3600) // 1 hour from now
    
    toastIdRef.current = pending('Adding Liquidity...', `${amount0} ${selectedPool.token0.symbol} + ${amount1} ${selectedPool.token1.symbol}`)
    writeAddLiquidity({
      address: selectedPool.address,
      abi: XYLO_POOL_ABI,
      functionName: 'addLiquidity',
      args: [[amt0, amt1], minLpTokens, address, deadline],
    })
  }

  const handleRemoveLiquidity = () => {
    if (!selectedPool || !lpAmount || !address) return
    const lpAmt = parseUnits(lpAmount, 18) // LP tokens have 18 decimals
    const deadline = BigInt(Math.floor(Date.now() / 1000) + 3600) // 1 hour from now
    
    toastIdRef.current = pending('Removing Liquidity...', `${lpAmount} LP tokens`)
    writeRemoveLiquidity({
      address: selectedPool.address,
      abi: XYLO_POOL_ABI,
      functionName: 'removeLiquidity',
      args: [lpAmt, [ZERO, ZERO], address, deadline], // [minAmounts] as array
    })
  }

  const getBalance = (token: typeof TOKENS.USDC) => {
    if (token.symbol === 'USDC') return usdcBalance?.formatted ?? '0'
    if (token.symbol === 'EURC') return eurcBalance?.formatted ?? '0'
    if (token.symbol === 'USYC') return usycBalance?.formatted ?? '0'
    return '0'
  }

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

  return (
    <div className="min-h-[calc(100vh-4rem)] px-3 sm:px-4 py-6 sm:py-12 relative overflow-hidden">
      {/* Confetti celebration */}
      <Confetti isActive={showConfetti} />
      
      {/* Cinematic Background */}
      <div className="absolute inset-0 bg-[#0f172a]">
        <div 
          className="absolute w-[1100px] h-[1100px] rounded-full opacity-20 blur-[150px] transition-all duration-700"
          style={{
            background: 'radial-gradient(circle, rgba(16,185,129,0.8) 0%, rgba(5,150,105,0.4) 50%, transparent 70%)',
            top: `calc(${mousePosition.y * 100}% - 550px)`,
            left: `calc(${mousePosition.x * 100}% - 550px)`,
          }}
        />
        <div 
          className="absolute w-[900px] h-[900px] rounded-full opacity-15 blur-[120px] transition-all duration-1000"
          style={{
            background: 'radial-gradient(circle, rgba(34,197,94,0.6) 0%, rgba(22,163,74,0.3) 60%, transparent 70%)',
            bottom: `calc(${(1-mousePosition.y) * 80}% - 450px)`,
            right: `calc(${(1-mousePosition.x) * 80}% - 450px)`,
          }}
        />
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }} />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 glass-premium border border-[#0A786A]/20 rounded-full px-4 py-2 mb-6 magnetic-hover">
            <Droplets className="w-4 h-4 text-[#01C38E] animate-pulse" />
            <span className="text-[#01C38E] font-medium text-sm">Advanced LP Management</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            <span className="block text-white mb-2">Provide Liquidity</span>
            <span className="relative inline-block">
              <span className="relative z-10 bg-gradient-to-r from-[#01C38E] via-[#0A786A] to-[#0A786A] text-transparent bg-clip-text animate-gradient-flow" style={{ backgroundSize: '200% 200%' }}>
                Earn Passive Income
              </span>
              <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-[#01C38E] via-[#0A786A] to-[#0A786A] rounded-full blur-sm animate-expand" />
            </span>
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto px-2">
            Earn <span className="text-[#01C38E] font-semibold">0.04% fees</span> on every swap.{' '}
            <span className="text-[#01C38E] font-semibold">StableSwap</span> curve minimizes impermanent loss.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6 mb-8 sm:mb-12 stagger-fade">
          <TiltCard tiltAmount={6}>
            <div className="glass-premium rounded-xl p-4 sm:p-6 h-full">
              <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#0A786A] to-[#01C38E] flex items-center justify-center depth-shadow">
                  <Droplets className="w-4 h-4 text-white" />
                </div>
                <span className="text-[var(--text-secondary)] text-xs sm:text-base flex items-center gap-1">
                  <span className="hidden sm:inline">Total Value Locked</span>
                  <span className="sm:hidden">TVL</span>
                  <InfoTooltip term="TVL" />
                </span>
              </div>
              <div className="text-xl sm:text-3xl font-bold bg-gradient-to-r from-[#01C38E] to-[#0A786A] bg-clip-text text-transparent">{formatUSD(totalTVL)}</div>
              <Sparkline data={volumeData} height={24} className="mt-2 sm:mt-3 hidden sm:block" />
            </div>
          </TiltCard>
          <TiltCard tiltAmount={6}>
            <div className="glass-premium rounded-xl p-4 sm:p-6 h-full">
              <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#01C38E] to-[#0A786A] flex items-center justify-center depth-shadow">
                  <BarChart3 className="w-4 h-4 text-white" />
                </div>
                <span className="text-[var(--text-secondary)] text-xs sm:text-base">
                  <span className="hidden sm:inline">24h Volume (Est.)</span>
                  <span className="sm:hidden">24h Vol</span>
                </span>
              </div>
              <div className="text-xl sm:text-3xl font-bold bg-gradient-to-r from-[#01C38E] to-[#01C38E] bg-clip-text text-transparent">{formatUSD(totalTVL * 0.05)}</div>
              <div className="text-[10px] sm:text-xs text-[var(--text-muted)] mt-0.5 sm:mt-1">~5% daily turnover</div>
            </div>
          </TiltCard>
          <TiltCard tiltAmount={6}>
            <div className="glass-premium rounded-xl p-4 sm:p-6 h-full">
              <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#01C38E] to-[#0A786A] flex items-center justify-center depth-shadow">
                  <TrendingUp className="w-4 h-4 text-white" />
                </div>
                <span className="text-[var(--text-secondary)] text-xs sm:text-base">
                  <span className="hidden sm:inline">Your LP Positions</span>
                  <span className="sm:hidden">Positions</span>
                </span>
              </div>
              <div className="text-xl sm:text-3xl font-bold bg-gradient-to-r from-[#01C38E] to-[#01C38E] bg-clip-text text-transparent">
                {pools.filter(p => p.userLpBalance > ZERO).length}
              </div>
            </div>
          </TiltCard>
          <TiltCard tiltAmount={6}>
            <div className="glass-premium rounded-xl p-4 sm:p-6 h-full">
              <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center depth-shadow">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <span className="text-[var(--text-secondary)] text-xs sm:text-base">
                  <span className="hidden sm:inline">Active Pools</span>
                  <span className="sm:hidden">Pools</span>
                </span>
              </div>
              <div className="text-xl sm:text-3xl font-bold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">{pools.length}</div>
            </div>
          </TiltCard>
        </div>

        {/* Pools List */}
        <div className="glass-premium rounded-xl overflow-hidden holographic">
          <div className="px-6 py-4 border-b border-[var(--card-border)]">
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">All Pools</h2>
          </div>
          
          {/* Table Header - Desktop only */}
          <div className="hidden md:grid grid-cols-6 gap-4 px-6 py-3 text-sm text-gray-400 border-b border-white/5">
            <div>Pool</div>
            <div className="text-right">TVL</div>
            <div className="text-right">24h Fees (Est.)</div>
            <div className="text-right">Your LP</div>
            <div className="text-right">Your Share</div>
            <div className="text-right">Actions</div>
          </div>

          {/* Pool Rows */}
          {pools.map((pool) => {
            const tvl = calculateTVL(pool)
            const dailyFees = tvl * 0.0004 * 0.05 // 0.04% fee * 5% daily volume
            const userShare = pool.totalSupply > ZERO 
              ? Number(pool.userLpBalance * BigInt(10000) / pool.totalSupply) / 100 
              : 0
            return (
              <div
                key={pool.id}
                className="flex flex-col md:grid md:grid-cols-6 gap-3 md:gap-4 px-4 sm:px-6 py-4 hover:bg-white/5 transition-colors border-b border-white/5 last:border-0"
              >
                {/* Mobile: Pool name and actions on same row */}
                <div className="flex items-center justify-between md:justify-start md:gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex -space-x-2">
                      <TokenLogo symbol={pool.token0.symbol} size={28} className="border-2 border-gray-900 rounded-full sm:w-8 sm:h-8" />
                      <TokenLogo symbol={pool.token1.symbol} size={28} className="border-2 border-gray-900 rounded-full sm:w-8 sm:h-8" />
                    </div>
                    <div>
                      <div className="font-medium text-white text-sm sm:text-base">
                        {pool.token0.symbol}/{pool.token1.symbol}
                      </div>
                      <div className="text-xs sm:text-sm text-gray-400">StableSwap</div>
                    </div>
                  </div>
                  {/* Mobile actions */}
                  <div className="flex gap-2 md:hidden">
                    <button
                      onClick={() => {
                        if (pool.id === 'USDC-USYC') return
                        setSelectedPool(pool)
                        setShowAddLiquidity(true)
                      }}
                      disabled={pool.id === 'USDC-USYC'}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors min-h-[36px]",
                        pool.id === 'USDC-USYC'
                          ? "bg-gray-500/10 text-gray-500 cursor-not-allowed"
                          : "bg-[#0A786A]/20 hover:bg-[#0A786A]/30 text-[#01C38E]"
                      )}
                    >
                      {pool.id === 'USDC-USYC' ? 'Coming Soon' : 'Add'}
                    </button>
                    {pool.userLpBalance > ZERO && (
                      <button
                        onClick={() => {
                          setSelectedPool(pool)
                          setShowRemoveLiquidity(true)
                        }}
                        className="px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-xs font-medium transition-colors min-h-[36px]"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>

                {/* Mobile: Stats grid */}
                <div className="grid grid-cols-2 gap-2 md:hidden text-sm">
                  <div className="bg-white/5 rounded-lg p-2">
                    <div className="text-gray-400 text-xs">TVL</div>
                    <div className="text-white font-medium">{formatUSD(tvl)}</div>
                  </div>
                  <div className="bg-white/5 rounded-lg p-2">
                    <div className="text-gray-400 text-xs">24h Fees</div>
                    <div className="text-green-400 font-medium">{formatUSD(dailyFees)}</div>
                  </div>
                  <div className="bg-white/5 rounded-lg p-2">
                    <div className="text-gray-400 text-xs">Your LP</div>
                    <div className="text-white font-medium">{formatNumber(formatUnits(pool.userLpBalance, 18), 4)}</div>
                  </div>
                  <div className="bg-white/5 rounded-lg p-2">
                    <div className="text-gray-400 text-xs">Your Share</div>
                    <div className="text-[#01C38E] font-medium">{formatNumber(userShare, 2)}%</div>
                  </div>
                </div>

                {/* Desktop columns */}
                <div className="text-right text-white hidden md:block">{formatUSD(tvl)}</div>
                <div className="text-right hidden md:block">
                  <span className="text-[#01C38E]">{formatUSD(dailyFees)}</span>
                </div>
                <div className="text-right text-white hidden md:block">
                  {formatNumber(formatUnits(pool.userLpBalance, 18), 4)} LP
                </div>
                <div className="text-right hidden md:block">
                  <span className="text-[#01C38E] font-medium">{formatNumber(userShare, 2)}%</span>
                </div>
                <div className="hidden md:flex justify-end gap-2">
                  <button
                    onClick={() => {
                      if (pool.id === 'USDC-USYC') return
                      setSelectedPool(pool)
                      setShowAddLiquidity(true)
                    }}
                    disabled={pool.id === 'USDC-USYC'}
                    className={cn(
                      "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                      pool.id === 'USDC-USYC'
                        ? "bg-gray-500/10 text-gray-500 cursor-not-allowed"
                        : "bg-[#0A786A]/20 hover:bg-[#0A786A]/30 text-[#01C38E]"
                    )}
                  >
                    {pool.id === 'USDC-USYC' ? 'Coming Soon' : 'Add'}
                  </button>
                  {pool.userLpBalance > ZERO && (
                    <button
                      onClick={() => {
                        setSelectedPool(pool)
                        setShowRemoveLiquidity(true)
                      }}
                      className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-sm font-medium transition-colors"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Add Liquidity Info */}
        <TiltCard tiltAmount={4} glareEnabled={true}>
          <div className="mt-6 sm:mt-8 p-4 sm:p-6 glass-premium rounded-xl holographic">
            <h3 className="text-base sm:text-lg font-semibold text-white mb-2 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#01C38E]" />
              Earn Fees as a Liquidity Provider
            </h3>
            <p className="text-gray-400 text-sm sm:text-base mb-4">
              When you add liquidity, you receive LP tokens representing your share of the pool. 
              Earn 0.04% of all trades proportional to your share. StableSwap curve ensures minimal impermanent loss for stablecoin pairs.
            </p>
            <div className="flex flex-wrap gap-3 sm:gap-4 text-xs sm:text-sm">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0A786A]/10 border border-[#0A786A]/30">
                <div className="w-2 h-2 rounded-full bg-[#01C38E] animate-pulse" />
                <span className="text-[#01C38E]">0.04% swap fee</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#01C38E]/10 border border-[#01C38E]/30">
                <div className="w-2 h-2 rounded-full bg-[#01C38E] animate-pulse" />
                <span className="text-[#01C38E]">StableSwap curve</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#01C38E]/10 border border-[#01C38E]/30">
                <div className="w-2 h-2 rounded-full bg-[#01C38E] animate-pulse" />
                <span className="text-[#01C38E]">Minimal IL for stable pairs</span>
              </div>
            </div>
          </div>
        </TiltCard>
      </div>

      {/* Add Liquidity Modal */}
      {showAddLiquidity && selectedPool && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="bg-gray-900 rounded-t-xl sm:rounded-xl border border-white/10 p-4 sm:p-6 w-full max-w-md sm:mx-4 safe-area-bottom animate-slide-up sm:animate-scale-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h3 className="text-base sm:text-lg font-semibold text-white">
                Add Liquidity to {selectedPool.token0.symbol}/{selectedPool.token1.symbol}
              </h3>
              <button
                onClick={() => { setShowAddLiquidity(false); setAmount0(''); setAmount1(''); }}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <span className="text-gray-400">✕</span>
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-white/5 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">{selectedPool.token0.symbol}</span>
                  <button 
                    onClick={() => setAmount0(getBalance(selectedPool.token0 as typeof TOKENS.USDC))}
                    className="text-sm text-gray-400 hover:text-white"
                  >
                    Balance: {formatNumber(getBalance(selectedPool.token0 as typeof TOKENS.USDC), 2)}
                  </button>
                </div>
                <input
                  type="number"
                  value={amount0}
                  onChange={(e) => setAmount0(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-transparent text-xl sm:text-2xl font-medium text-white outline-none"
                />
              </div>

              <div className="bg-white/5 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">{selectedPool.token1.symbol}</span>
                  <button 
                    onClick={() => setAmount1(getBalance(selectedPool.token1 as typeof TOKENS.USDC))}
                    className="text-sm text-gray-400 hover:text-white"
                  >
                    Balance: {formatNumber(getBalance(selectedPool.token1 as typeof TOKENS.USDC), 2)}
                  </button>
                </div>
                <input
                  type="number"
                  value={amount1}
                  onChange={(e) => setAmount1(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-transparent text-xl sm:text-2xl font-medium text-white outline-none"
                />
              </div>

              {/* Approval buttons if needed */}
              {needsApproval0 && (
                <button
                  onClick={handleApprove0}
                  disabled={isLoading}
                  className="w-full py-3 rounded-lg font-semibold bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 transition-all flex items-center justify-center gap-2"
                >
                  {isApproving0 || isApprove0Confirming ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Approving {selectedPool.token0.symbol}...</>
                  ) : (
                    `Approve ${selectedPool.token0.symbol}`
                  )}
                </button>
              )}

              {needsApproval1 && !needsApproval0 && (
                <button
                  onClick={handleApprove1}
                  disabled={isLoading}
                  className="w-full py-3 rounded-lg font-semibold bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 transition-all flex items-center justify-center gap-2"
                >
                  {isApproving1 || isApprove1Confirming ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Approving {selectedPool.token1.symbol}...</>
                  ) : (
                    `Approve ${selectedPool.token1.symbol}`
                  )}
                </button>
              )}

              <button
                onClick={handleAddLiquidity}
                disabled={!isConnected || !amount0 || !amount1 || needsApproval0 || needsApproval1 || isLoading}
                className={cn(
                  'w-full py-3.5 sm:py-4 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 min-h-[48px]',
                  isConnected && amount0 && amount1 && !needsApproval0 && !needsApproval1 && !isLoading
                    ? 'bg-gradient-to-r from-[#0A786A] to-[#01C38E] hover:from-[#132D46] hover:to-[#0A786A] text-white active:scale-[0.98]'
                    : 'bg-white/10 text-gray-500 cursor-not-allowed'
                )}
              >
                {isAdding || isAddConfirming ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Adding Liquidity...</>
                ) : !isConnected ? (
                  'Connect Wallet'
                ) : !amount0 || !amount1 ? (
                  'Enter Amounts'
                ) : (
                  'Add Liquidity'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Remove Liquidity Modal */}
      {showRemoveLiquidity && selectedPool && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="bg-gray-900 rounded-t-xl sm:rounded-xl border border-white/10 p-4 sm:p-6 w-full max-w-md sm:mx-4 safe-area-bottom animate-slide-up sm:animate-scale-in">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h3 className="text-base sm:text-lg font-semibold text-white">
                Remove Liquidity from {selectedPool.token0.symbol}/{selectedPool.token1.symbol}
              </h3>
              <button
                onClick={() => { setShowRemoveLiquidity(false); setLpAmount(''); }}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <span className="text-gray-400">✕</span>
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-white/5 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">LP Tokens</span>
                  <button 
                    onClick={() => setLpAmount(formatUnits(selectedPool.userLpBalance, 18))}
                    className="text-sm text-gray-400 hover:text-white"
                  >
                    Balance: {formatNumber(formatUnits(selectedPool.userLpBalance, 18), 4)}
                  </button>
                </div>
                <input
                  type="number"
                  value={lpAmount}
                  onChange={(e) => setLpAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-transparent text-xl sm:text-2xl font-medium text-white outline-none"
                />
              </div>

              <button
                onClick={handleRemoveLiquidity}
                disabled={!isConnected || !lpAmount || isLoading}
                className={cn(
                  'w-full py-3.5 sm:py-4 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 min-h-[48px]',
                  isConnected && lpAmount && !isLoading
                    ? 'bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white active:scale-[0.98]'
                    : 'bg-white/10 text-gray-500 cursor-not-allowed'
                )}
              >
                {isRemoving || isRemoveConfirming ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Removing Liquidity...</>
                ) : !isConnected ? (
                  'Connect Wallet'
                ) : !lpAmount ? (
                  'Enter Amount'
                ) : (
                  'Remove Liquidity'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
