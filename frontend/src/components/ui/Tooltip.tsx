'use client'

import { useState, ReactNode } from 'react'
import { HelpCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TooltipProps {
  content: string
  children?: ReactNode
  position?: 'top' | 'bottom' | 'left' | 'right'
  className?: string
}

export function Tooltip({ content, children, position = 'top', className }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false)

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  }

  const arrowClasses = {
    top: 'top-full left-1/2 -translate-x-1/2 border-t-[var(--card-border)]',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-[var(--card-border)]',
    left: 'left-full top-1/2 -translate-y-1/2 border-l-[var(--card-border)]',
    right: 'right-full top-1/2 -translate-y-1/2 border-r-[var(--card-border)]',
  }

  return (
    <div
      className={cn('relative inline-flex', className)}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children || (
        <HelpCircle className="w-4 h-4 text-[var(--text-muted)] hover:text-[var(--text-secondary)] cursor-help transition-colors" />
      )}
      
      <div
        className={cn(
          'absolute z-50 px-3 py-2 text-xs max-w-xs',
          'bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg',
          'text-[var(--text-secondary)] shadow-xl',
          'transition-all duration-200',
          positionClasses[position],
          isVisible ? 'opacity-100 visible' : 'opacity-0 invisible'
        )}
      >
        {content}
        <div
          className={cn(
            'absolute border-4 border-transparent',
            arrowClasses[position]
          )}
        />
      </div>
    </div>
  )
}

// Pre-defined tooltips for common DeFi terms
export const TOOLTIPS = {
  APY: 'Annual Percentage Yield - The real rate of return earned on your deposit, including compound interest.',
  TVL: 'Total Value Locked - The total value of assets deposited in the protocol.',
  SLIPPAGE: 'The difference between expected price and actual execution price due to market movement.',
  PRICE_IMPACT: 'The impact your trade has on the pool price. Lower is better.',
  LP_TOKENS: 'Liquidity Provider tokens represent your share of the pool. You receive these when adding liquidity.',
  IMPERMANENT_LOSS: 'Potential loss from providing liquidity when token prices change relative to holding.',
  SWAP_FEE: 'Fee charged on each swap, paid to liquidity providers.',
  NETWORK_FEE: 'Gas fee paid to the network for processing your transaction.',
}

interface InfoTooltipProps {
  term: keyof typeof TOOLTIPS
  className?: string
}

export function InfoTooltip({ term, className }: InfoTooltipProps) {
  return (
    <Tooltip content={TOOLTIPS[term]} className={className}>
      <HelpCircle className="w-3.5 h-3.5 text-[var(--text-muted)] hover:text-[var(--text-secondary)] cursor-help transition-colors" />
    </Tooltip>
  )
}
