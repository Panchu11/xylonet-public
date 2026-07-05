'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import { useAccount, useBalance, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { parseUnits, formatUnits } from 'viem'
import { ArrowDownUp, Settings, ChevronDown, Loader2, AlertCircle } from 'lucide-react'
import { TOKENS, CONTRACTS } from '@/config/constants'
import { XYLO_ROUTER_ABI, ERC20_ABI } from '@/config/abis'
import { cn, formatNumber } from '@/lib/utils'
import { useTxToast } from '@/components/ui/Toast'
import { TokenLogo } from '@/components/ui/TokenLogos'
import { saveTransaction } from '@/lib/transactions'
import { InfoTooltip } from '@/components/ui/Tooltip'
import { Confetti } from '@/components/ui/Confetti'
import { USDValue } from '@/components/ui/EmptyState'

type TokenKey = keyof typeof TOKENS

interface SwapWidgetProps {
  className?: string
}

export function SwapWidget({ className }: SwapWidgetProps) {
  const { address, isConnected } = useAccount()
  const { pending, success, error } = useTxToast()
  const toastIdRef = useRef<string | null>(null)
  
  const [tokenIn, setTokenIn] = useState<TokenKey>('USDC')
  const [tokenOut, setTokenOut] = useState<TokenKey>('EURC')
  const [amountIn, setAmountIn] = useState('')
  const [amountOut, setAmountOut] = useState('')
  const [showTokenSelect, setShowTokenSelect] = useState<'in' | 'out' | null>(null)
  const [slippage, setSlippage] = useState('0.5')
  const [showSettings, setShowSettings] = useState(false)
  const [needsApproval, setNeedsApproval] = useState(false)
  const [swapRotation, setSwapRotation] = useState(0)
  const [showConfetti, setShowConfetti] = useState(false)
  const [lastProcessedSwapHash, setLastProcessedSwapHash] = useState<string | null>(null)
  const [lastProcessedApproveHash, setLastProcessedApproveHash] = useState<string | null>(null)

  // Contract write hooks
  const { writeContract: writeApprove, data: approveHash, isPending: isApproving } = useWriteContract()
  const { writeContract: writeSwap, data: swapHash, isPending: isSwapping } = useWriteContract()
  
  // Wait for transactions
  const { isLoading: isApproveConfirming, isSuccess: isApproveConfirmed, isError: isApproveError } = useWaitForTransactionReceipt({ hash: approveHash })
  const { isLoading: isSwapConfirming, isSuccess: isSwapConfirmed, isError: isSwapError } = useWaitForTransactionReceipt({ hash: swapHash })

  const isLoading = isApproving || isApproveConfirming || isSwapping || isSwapConfirming
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Get token balances
  const { data: balanceIn, refetch: refetchBalanceIn } = useBalance({
    address,
    token: TOKENS[tokenIn].address,
  })

  const { data: balanceOut, refetch: refetchBalanceOut } = useBalance({
    address,
    token: TOKENS[tokenOut].address,
  })

  // Check allowance
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: TOKENS[tokenIn].address,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: address ? [address, CONTRACTS.ROUTER] : undefined,
  })

  // Get quote from router
  const { data: quoteData } = useReadContract({
    address: CONTRACTS.ROUTER,
    abi: XYLO_ROUTER_ABI,
    functionName: 'getAmountOut',
    args: amountIn && parseFloat(amountIn) > 0 
      ? [TOKENS[tokenIn].address, TOKENS[tokenOut].address, parseUnits(amountIn, TOKENS[tokenIn].decimals)]
      : undefined,
  })

  // Update amountOut when quote changes
  useEffect(() => {
    if (quoteData) {
      setAmountOut(formatUnits(quoteData as bigint, TOKENS[tokenOut].decimals))
    }
  }, [quoteData, tokenOut])

  // Check if approval needed
  useEffect(() => {
    if (allowance !== undefined && amountIn && parseFloat(amountIn) > 0) {
      const amountInWei = parseUnits(amountIn, TOKENS[tokenIn].decimals)
      setNeedsApproval((allowance as bigint) < amountInWei)
    }
  }, [allowance, amountIn, tokenIn])

  // Refetch allowance after approval
  useEffect(() => {
    if (isApproveConfirmed && approveHash && approveHash !== lastProcessedApproveHash) {
      setLastProcessedApproveHash(approveHash)
      refetchAllowance()
      if (toastIdRef.current) {
        success(toastIdRef.current, 'Approval Successful!', approveHash)
        toastIdRef.current = null
      }
    }
  }, [isApproveConfirmed, approveHash, lastProcessedApproveHash, refetchAllowance, success])

  // Handle swap success
  useEffect(() => {
    // Only process each swap hash once
    if (isSwapConfirmed && swapHash && swapHash !== lastProcessedSwapHash) {
      setLastProcessedSwapHash(swapHash)
      
      if (toastIdRef.current) {
        success(toastIdRef.current, 'Swap Successful!', swapHash)
        toastIdRef.current = null
      }
      // Show confetti celebration
      setShowConfetti(true)
      setTimeout(() => setShowConfetti(false), 100)
      // Save to history
      saveTransaction({
        hash: swapHash,
        type: 'swap',
        timestamp: Date.now(),
        tokenIn: TOKENS[tokenIn].symbol,
        tokenOut: TOKENS[tokenOut].symbol,
        amountIn: amountIn,
        amountOut: amountOut,
        status: 'success',
      })
      // Refetch balances to show updated amounts
      refetchBalanceIn()
      refetchBalanceOut()
      // Reset input fields
      setAmountIn('')
      setAmountOut('')
      setErrorMsg(null)
    }
  }, [isSwapConfirmed, swapHash, lastProcessedSwapHash, success, tokenIn, tokenOut, amountIn, amountOut, refetchBalanceIn, refetchBalanceOut])

  // Handle errors
  useEffect(() => {
    if (isApproveError && toastIdRef.current) {
      error(toastIdRef.current, 'Approval Failed', 'Transaction was rejected or failed')
      toastIdRef.current = null
    }
  }, [isApproveError, error])

  useEffect(() => {
    if (isSwapError && toastIdRef.current) {
      error(toastIdRef.current, 'Swap Failed', 'Transaction was rejected or failed. Check pool liquidity.')
      toastIdRef.current = null
      setErrorMsg('Swap failed. Please check pool liquidity and try again.')
    }
  }, [isSwapError, error])

  // Calculate exchange rate
  const exchangeRate = useMemo(() => {
    if (amountIn && amountOut && parseFloat(amountIn) > 0) {
      return parseFloat(amountOut) / parseFloat(amountIn)
    }
    // Default rates for display
    if (tokenIn === 'USDC' && tokenOut === 'EURC') return 0.92
    if (tokenIn === 'EURC' && tokenOut === 'USDC') return 1.08
    return 1
  }, [amountIn, amountOut, tokenIn, tokenOut])

  // Calculate output amount
  const handleAmountInChange = (value: string) => {
    setAmountIn(value)
    if (value && !isNaN(parseFloat(value))) {
      const output = parseFloat(value) * exchangeRate
      setAmountOut(output.toFixed(6))
    } else {
      setAmountOut('')
    }
  }

  // Swap tokens
  const handleSwapTokens = () => {
    setSwapRotation(prev => prev + 180)
    setTokenIn(tokenOut)
    setTokenOut(tokenIn)
    setAmountIn(amountOut)
    setAmountOut(amountIn)
  }

  // Handle token selection
  const handleTokenSelect = (token: TokenKey) => {
    if (showTokenSelect === 'in') {
      if (token === tokenOut) {
        handleSwapTokens()
      } else {
        setTokenIn(token)
      }
    } else if (showTokenSelect === 'out') {
      if (token === tokenIn) {
        handleSwapTokens()
      } else {
        setTokenOut(token)
      }
    }
    setShowTokenSelect(null)
    setAmountIn('')
    setAmountOut('')
  }

  // Execute swap
  const handleSwap = async () => {
    if (!isConnected || !amountIn || !address) return
    
    const amountInWei = parseUnits(amountIn, TOKENS[tokenIn].decimals)
    const minAmountOut = parseUnits(
      (parseFloat(amountOut) * (1 - parseFloat(slippage) / 100)).toFixed(TOKENS[tokenOut].decimals),
      TOKENS[tokenOut].decimals
    )
    const deadline = BigInt(Math.floor(Date.now() / 1000) + 1200) // 20 minutes
    
    if (needsApproval) {
      // Approve MAX to router - "Approve once, swap forever"
      const MAX_UINT256 = BigInt('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff')
      toastIdRef.current = pending('Approving ' + TOKENS[tokenIn].symbol + '...', 'One-time approval - swap forever!')
      writeApprove({
        address: TOKENS[tokenIn].address,
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [CONTRACTS.ROUTER, MAX_UINT256],
      })
    } else {
      // Execute swap - pass as struct (tuple)
      toastIdRef.current = pending('Swapping...', `${amountIn} ${TOKENS[tokenIn].symbol} → ${amountOut} ${TOKENS[tokenOut].symbol}`)
      const swapParams = {
        tokenIn: TOKENS[tokenIn].address,
        tokenOut: TOKENS[tokenOut].address,
        amountIn: amountInWei,
        minAmountOut: minAmountOut,
        to: address,
        deadline: deadline,
      }
      writeSwap({
        address: CONTRACTS.ROUTER,
        abi: XYLO_ROUTER_ABI,
        functionName: 'swap',
        args: [swapParams] as const,
      })
    }
  }

  const priceImpact = useMemo(() => {
    // Calculate price impact (simplified)
    if (!amountIn || parseFloat(amountIn) === 0) return 0
    return Math.abs(1 - exchangeRate) * 0.1 // Very low for stablecoins
  }, [amountIn, exchangeRate])

  return (
    <div className={cn('w-full max-w-md mx-auto px-2 sm:px-0', className)}>
      {/* Confetti celebration */}
      <Confetti isActive={showConfetti} />
      
      <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl p-3 sm:p-4 card-lift">
        {/* Header */}
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <h2 className="text-base sm:text-lg font-semibold text-[var(--text-primary)]">Swap</h2>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 rounded-lg hover:bg-[var(--card-border)] transition-colors"
          >
            <Settings className="w-5 h-5 text-[var(--text-secondary)]" />
          </button>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="mb-4 p-3 bg-[var(--card-border)] rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[var(--text-secondary)]">Slippage Tolerance</span>
              <div className="flex items-center gap-2">
                {['0.1', '0.5', '1.0'].map((val) => (
                  <button
                    key={val}
                    onClick={() => setSlippage(val)}
                    className={cn(
                      'px-3 py-1 rounded-lg text-sm transition-colors',
                      slippage === val
                        ? 'bg-[var(--primary)] text-white'
                        : 'bg-[var(--card-border)] text-[var(--text-secondary)] hover:bg-[var(--card-bg)]'
                    )}
                  >
                    {val}%
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Token In */}
        <div className="bg-[var(--card-border)] rounded-lg p-3 sm:p-4 mb-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-[var(--text-secondary)]">You pay</span>
            {balanceIn && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleAmountInChange(balanceIn.formatted)}
                  className="max-button"
                >
                  MAX
                </button>
                <button
                  onClick={() => handleAmountInChange(balanceIn.formatted)}
                  className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                >
                  {formatNumber(balanceIn.formatted, 2)}
                </button>
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <input
                type="number"
                value={amountIn}
                onChange={(e) => handleAmountInChange(e.target.value)}
                placeholder="0.00"
                className="w-full bg-transparent text-xl sm:text-2xl font-medium text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)]"
              />
              <USDValue amount={amountIn} />
            </div>
            <button
              onClick={() => setShowTokenSelect('in')}
              className="flex items-center gap-1.5 sm:gap-2 bg-[var(--card-bg)] hover:bg-[var(--card-border)] rounded-full px-2.5 sm:px-3 py-1.5 sm:py-2 transition-colors animate-bounce-subtle flex-shrink-0"
            >
              <TokenLogo symbol={TOKENS[tokenIn].symbol} size={20} className="sm:w-6 sm:h-6" />
              <span className="font-medium text-[var(--text-primary)] text-sm sm:text-base">{TOKENS[tokenIn].symbol}</span>
              <ChevronDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[var(--text-secondary)]" />
            </button>
          </div>
        </div>

        {/* Swap Button */}
        <div className="flex justify-center -my-3 relative z-10">
          <button
            onClick={handleSwapTokens}
            className="bg-[var(--card-bg)] hover:bg-[var(--card-border)] border-4 border-[var(--background)] rounded-lg p-2 transition-all hover:scale-110"
            style={{ transform: `rotate(${swapRotation}deg)`, transition: 'transform 0.3s ease' }}
          >
            <ArrowDownUp className="w-5 h-5 text-[var(--text-secondary)]" />
          </button>
        </div>

        {/* Token Out */}
        <div className="bg-[var(--card-border)] rounded-lg p-3 sm:p-4 mt-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-[var(--text-secondary)]">You receive</span>
            {balanceOut && (
              <span className="text-sm text-[var(--text-secondary)]">
                Balance: {formatNumber(balanceOut.formatted, 2)}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <input
                type="number"
                value={amountOut}
                readOnly
                placeholder="0.00"
                className="w-full bg-transparent text-xl sm:text-2xl font-medium text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)]"
              />
              <USDValue amount={amountOut} />
            </div>
            <button
              onClick={() => setShowTokenSelect('out')}
              className="flex items-center gap-1.5 sm:gap-2 bg-[var(--card-bg)] hover:bg-[var(--card-border)] rounded-full px-2.5 sm:px-3 py-1.5 sm:py-2 transition-colors animate-bounce-subtle flex-shrink-0"
            >
              <TokenLogo symbol={TOKENS[tokenOut].symbol} size={20} className="sm:w-6 sm:h-6" />
              <span className="font-medium text-[var(--text-primary)] text-sm sm:text-base">{TOKENS[tokenOut].symbol}</span>
              <ChevronDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[var(--text-secondary)]" />
            </button>
          </div>
        </div>

        {/* Error Message */}
        {errorMsg && (
          <div className="mt-4 p-3 bg-[var(--error)]/10 border border-[var(--error)]/30 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-[var(--error)] flex-shrink-0" />
            <span className="text-sm text-[var(--error)]">{errorMsg}</span>
            <button onClick={() => setErrorMsg(null)} className="ml-auto text-[var(--error)] hover:text-[var(--text-primary)]">✕</button>
          </div>
        )}

        {/* Price Info */}
        {amountIn && amountOut && (
          <div className="mt-4 p-3 bg-[var(--card-border)] rounded-lg space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-[var(--text-secondary)]">Rate</span>
              <span className="text-[var(--text-primary)]">
                1 {TOKENS[tokenIn].symbol} = {formatNumber(exchangeRate, 4)} {TOKENS[tokenOut].symbol}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-[var(--text-secondary)] flex items-center gap-1">
                Price Impact
                <InfoTooltip term="PRICE_IMPACT" />
              </span>
              <span className={cn(
                priceImpact < 0.1 ? 'text-[var(--success)]' : 
                priceImpact < 1 ? 'text-[var(--warning)]' : 'text-[var(--error)]'
              )}>
                {formatNumber(priceImpact, 2)}%
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-[var(--text-secondary)] flex items-center gap-1">
                Network Fee
                <InfoTooltip term="NETWORK_FEE" />
              </span>
              <span className="text-[var(--text-primary)]">~$0.01</span>
            </div>
          </div>
        )}

        {/* Swap Button */}
        <button
          onClick={handleSwap}
          disabled={!isConnected || !amountIn || isLoading}
          className={cn(
            'w-full mt-4 py-3.5 sm:py-4 rounded-lg font-semibold text-base sm:text-lg transition-all min-h-[48px]',
            isConnected && amountIn && !isLoading
              ? 'bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white'
              : 'bg-[var(--card-border)] text-[var(--text-muted)] cursor-not-allowed'
          )}
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              {isApproving || isApproveConfirming ? 'Approving...' : 'Swapping...'}
            </span>
          ) : !isConnected ? (
            'Connect Wallet'
          ) : !amountIn ? (
            'Enter Amount'
          ) : needsApproval ? (
            `Approve ${TOKENS[tokenIn].symbol}`
          ) : (
            'Swap'
          )}
        </button>

        {/* Arc Network Badge */}
        <div className="mt-3 sm:mt-4 flex items-center justify-center gap-2 text-[10px] sm:text-xs text-[var(--text-muted)] text-center">
          <div className="w-2 h-2 rounded-full bg-[var(--success)] animate-pulse flex-shrink-0" />
          <span>Powered by Arc Network • Sub-second finality • ~$0.01 fees</span>
        </div>
      </div>

      {/* Token Select Modal */}
      {showTokenSelect && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="bg-[var(--card-bg)] rounded-t-xl sm:rounded-xl border border-[var(--card-border)] p-4 w-full max-w-sm sm:mx-4 safe-area-bottom animate-slide-up sm:animate-scale-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-[var(--text-primary)]">Select Token</h3>
              <button
                onClick={() => setShowTokenSelect(null)}
                className="p-2 rounded-lg hover:bg-[var(--card-border)] transition-colors"
              >
                <span className="text-[var(--text-secondary)]">✕</span>
              </button>
            </div>
            <div className="space-y-1 sm:space-y-2">
              {(Object.keys(TOKENS) as TokenKey[]).filter((key) => key !== 'USYC').map((key) => {
                const token = TOKENS[key]
                return (
                  <button
                    key={key}
                    onClick={() => handleTokenSelect(key)}
                    className="w-full flex items-center gap-3 p-3 sm:p-3 rounded-lg hover:bg-[var(--card-border)] active:bg-[var(--card-border)] transition-colors min-h-[56px]"
                  >
                    <TokenLogo symbol={token.symbol} size={36} />
                    <div className="flex-1 text-left">
                      <div className="font-medium text-[var(--text-primary)]">{token.symbol}</div>
                      <div className="text-sm text-[var(--text-secondary)]">{token.name}</div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
