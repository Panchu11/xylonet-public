'use client';

import { Zap, Trophy } from 'lucide-react';

interface PayXStatsProps {
  totalTips: number;
  tipsVolume: number;
  volume24h: number;
  tips24h: number;
  topTippers?: Array<{ address: string; amount: number }>;
}

function formatUSD(value: number): string {
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(2)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${value.toLocaleString('en-US', { maximumFractionDigits: 2 })}`;
}

function truncateAddress(addr: string): string {
  if (addr.length <= 12) return addr;
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

export function PayXStats({ totalTips, tipsVolume, volume24h, tips24h, topTippers }: PayXStatsProps) {
  return (
    <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] p-6">
      <div className="flex items-center gap-2 mb-6">
        <Zap size={20} className="text-amber-400" />
        <h3 className="text-lg font-semibold text-[var(--text-primary)]">PayX Tipping</h3>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div>
          <p className="text-xs text-[var(--text-muted)] mb-1">Total Tips</p>
          <p className="text-xl font-bold text-[var(--text-primary)] tabular-nums">
            {totalTips.toLocaleString()}
          </p>
        </div>
        <div>
          <p className="text-xs text-[var(--text-muted)] mb-1">Total Volume</p>
          <p className="text-xl font-bold text-[var(--text-primary)] tabular-nums">
            {formatUSD(tipsVolume)}
          </p>
        </div>
        <div>
          <p className="text-xs text-[var(--text-muted)] mb-1">24h Volume</p>
          <p className="text-xl font-bold text-[var(--text-primary)] tabular-nums">
            {formatUSD(volume24h)}
          </p>
        </div>
        <div>
          <p className="text-xs text-[var(--text-muted)] mb-1">24h Tips</p>
          <p className="text-xl font-bold text-[var(--text-primary)] tabular-nums">
            {tips24h.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Mini Leaderboard */}
      {topTippers && topTippers.length > 0 ? (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Trophy size={16} className="text-amber-400" />
            <p className="text-sm font-medium text-[var(--text-secondary)]">Top Tippers</p>
          </div>
          <div className="space-y-2">
            {topTippers.slice(0, 5).map((tipper, idx) => (
              <div
                key={tipper.address}
                className="flex items-center justify-between py-2 px-3 rounded-lg bg-[var(--surface-elevated)]/30"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-[var(--text-muted)] w-5">
                    #{idx + 1}
                  </span>
                  <span className="text-sm font-mono text-[var(--text-secondary)]">
                    {truncateAddress(tipper.address)}
                  </span>
                </div>
                <span className="text-sm font-semibold text-[var(--primary)] tabular-nums">
                  {formatUSD(tipper.amount)}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-4 text-sm text-[var(--text-muted)]">
          Leaderboard data will populate as more tips are sent.
        </div>
      )}
    </div>
  );
}
