'use client'

import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface EmptyStateProps {
  icon: ReactNode
  title: string
  description: string
  action?: ReactNode
  className?: string
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('empty-state', className)}>
      <div className="empty-state-icon">
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-2">{title}</h3>
      <p className="text-[var(--text-secondary)] max-w-sm mb-6">{description}</p>
      {action}
    </div>
  )
}

// Pre-built empty states for common scenarios
export function NoTransactionsEmptyState() {
  return (
    <EmptyState
      icon={
        <svg className="w-10 h-10 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      }
      title="No Transactions Yet"
      description="Your transaction history will appear here once you start swapping, providing liquidity, or using the vault."
    />
  )
}

export function NoPositionsEmptyState() {
  return (
    <EmptyState
      icon={
        <svg className="w-10 h-10 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      }
      title="No Positions"
      description="You don't have any liquidity positions yet. Add liquidity to a pool to start earning fees."
    />
  )
}

export function WalletNotConnectedEmptyState({ onConnect }: { onConnect?: () => void }) {
  return (
    <EmptyState
      icon={
        <svg className="w-10 h-10 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      }
      title="Connect Your Wallet"
      description="Connect your wallet to view your transaction history and positions."
      action={
        onConnect && (
          <button
            onClick={onConnect}
            className="px-6 py-3 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white rounded-lg font-semibold transition-all"
          >
            Connect Wallet
          </button>
        )
      }
    />
  )
}

// Sparkline component for simple charts
interface SparklineProps {
  data: number[]
  height?: number
  className?: string
  color?: string
}

export function Sparkline({ data, height = 40, className, color }: SparklineProps) {
  if (data.length === 0) return null
  
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1
  
  return (
    <div className={cn('sparkline', className)} style={{ height }}>
      {data.map((value, index) => {
        const barHeight = ((value - min) / range) * 100
        return (
          <div
            key={index}
            className="sparkline-bar"
            style={{ 
              height: `${Math.max(barHeight, 10)}%`,
              background: color || 'linear-gradient(to top, var(--primary), var(--secondary))'
            }}
          />
        )
      })}
    </div>
  )
}

// Progress indicator for multi-step transactions
interface StepIndicatorProps {
  steps: string[]
  currentStep: number
  className?: string
}

export function StepIndicator({ steps, currentStep, className }: StepIndicatorProps) {
  return (
    <div className={cn('step-indicator', className)}>
      {steps.map((step, index) => (
        <div key={index} className="flex items-center flex-1">
          <div
            className={cn(
              'step-dot',
              index < currentStep ? 'completed' : index === currentStep ? 'active' : 'pending'
            )}
          >
            {index < currentStep ? '✓' : index + 1}
          </div>
          {index < steps.length - 1 && (
            <div className={cn('step-line', index < currentStep ? 'completed' : '')} />
          )}
        </div>
      ))}
    </div>
  )
}

// USD value display helper
interface USDValueProps {
  amount: string | number
  price?: number // USD price per token
  className?: string
}

export function USDValue({ amount, price = 1, className }: USDValueProps) {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) || 0 : amount
  const usdValue = numAmount * price
  
  if (usdValue === 0) return null
  
  return (
    <span className={cn('usd-value', className)}>
      ≈ ${usdValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
    </span>
  )
}
