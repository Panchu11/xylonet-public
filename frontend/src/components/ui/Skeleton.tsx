// Skeleton Loading Components
import { cn } from '@/lib/utils'

interface SkeletonProps {
  className?: string
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-white/10',
        className
      )}
    />
  )
}

export function SkeletonCard({ className }: SkeletonProps) {
  return (
    <div className={cn('rounded-2xl border border-white/10 bg-white/5 p-6', className)}>
      <div className="flex items-center gap-4 mb-4">
        <Skeleton className="w-12 h-12 rounded-full" />
        <div className="flex-1">
          <Skeleton className="h-5 w-32 mb-2" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
      <div className="space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </div>
  )
}

export function SkeletonSwapWidget() {
  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-gradient-to-b from-gray-900/90 to-gray-900/70 backdrop-blur-xl rounded-3xl border border-white/10 p-4 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-8 w-8 rounded-lg" />
        </div>

        {/* Token In */}
        <div className="bg-white/5 rounded-2xl p-4 mb-2">
          <div className="flex items-center justify-between mb-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-24" />
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="flex-1 h-10" />
            <Skeleton className="h-10 w-28 rounded-full" />
          </div>
        </div>

        {/* Swap Button */}
        <div className="flex justify-center -my-3 relative z-10">
          <Skeleton className="h-12 w-12 rounded-xl" />
        </div>

        {/* Token Out */}
        <div className="bg-white/5 rounded-2xl p-4 mt-2">
          <div className="flex items-center justify-between mb-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-24" />
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="flex-1 h-10" />
            <Skeleton className="h-10 w-28 rounded-full" />
          </div>
        </div>

        {/* Button */}
        <Skeleton className="h-14 w-full mt-4 rounded-2xl" />
      </div>
    </div>
  )
}

export function SkeletonPoolCard() {
  return (
    <div className="bg-gradient-to-b from-white/5 to-white/[0.02] rounded-2xl border border-white/10 overflow-hidden p-6">
      <div className="flex items-center gap-4 mb-6">
        <div className="flex -space-x-2">
          <Skeleton className="w-10 h-10 rounded-full" />
          <Skeleton className="w-10 h-10 rounded-full" />
        </div>
        <div>
          <Skeleton className="h-6 w-28 mb-1" />
          <Skeleton className="h-4 w-20" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="bg-white/5 rounded-xl p-3">
          <Skeleton className="h-3 w-12 mb-2" />
          <Skeleton className="h-5 w-16" />
        </div>
        <div className="bg-white/5 rounded-xl p-3">
          <Skeleton className="h-3 w-12 mb-2" />
          <Skeleton className="h-5 w-16" />
        </div>
        <div className="bg-white/5 rounded-xl p-3">
          <Skeleton className="h-3 w-12 mb-2" />
          <Skeleton className="h-5 w-16" />
        </div>
      </div>
      <div className="flex gap-3">
        <Skeleton className="flex-1 h-10 rounded-xl" />
        <Skeleton className="flex-1 h-10 rounded-xl" />
      </div>
    </div>
  )
}

export function SkeletonVaultCard() {
  return (
    <div className="bg-gradient-to-b from-white/5 to-white/[0.02] rounded-2xl border border-white/10 overflow-hidden p-6">
      <div className="flex items-center gap-4 mb-6">
        <Skeleton className="w-16 h-16 rounded-xl" />
        <div>
          <Skeleton className="h-6 w-40 mb-2" />
          <Skeleton className="h-4 w-56" />
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white/5 rounded-xl p-4">
          <Skeleton className="h-4 w-24 mb-2" />
          <Skeleton className="h-8 w-20" />
        </div>
        <div className="bg-white/5 rounded-xl p-4">
          <Skeleton className="h-4 w-24 mb-2" />
          <Skeleton className="h-8 w-20" />
        </div>
      </div>
      <div className="flex gap-4">
        <Skeleton className="flex-1 h-12 rounded-xl" />
        <Skeleton className="flex-1 h-12 rounded-xl" />
      </div>
    </div>
  )
}

export function SkeletonStats() {
  return (
    <div className="grid md:grid-cols-3 gap-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white/5 rounded-2xl p-6 border border-white/10">
          <div className="flex items-center gap-3 mb-2">
            <Skeleton className="w-5 h-5 rounded" />
            <Skeleton className="h-4 w-28" />
          </div>
          <Skeleton className="h-9 w-24" />
        </div>
      ))}
    </div>
  )
}

export function SkeletonTable() {
  return (
    <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
      <div className="p-4 border-b border-white/10">
        <Skeleton className="h-6 w-40" />
      </div>
      <div className="divide-y divide-white/5">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="p-4 flex items-center gap-4">
            <Skeleton className="w-10 h-10 rounded-full" />
            <div className="flex-1">
              <Skeleton className="h-4 w-32 mb-1" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </div>
    </div>
  )
}
