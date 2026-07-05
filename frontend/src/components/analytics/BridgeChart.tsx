'use client';

import { useState } from 'react';
import { ArrowLeftRight, Info } from 'lucide-react';

interface ChainData {
  chain: string;
  volume: number;
  count: number;
}

interface BridgeChartProps {
  data: ChainData[];
  totalVolume: number;
  totalCount: number;
  volume24h: number;
}

const CHAIN_COLORS: Record<string, string> = {
  ethereum: '#627EEA',
  arbitrum: '#28A0F0',
  polygon: '#8247E5',
  base: '#0052FF',
  avalanche: '#E84142',
  optimism: '#FF0420',
  arc: '#01C38E',
  default: '#94a3b8',
};

function getChainColor(chain: string): string {
  const lower = chain.toLowerCase();
  for (const [key, color] of Object.entries(CHAIN_COLORS)) {
    if (lower.includes(key)) return color;
  }
  return CHAIN_COLORS.default;
}

function formatUSD(value: number): string {
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(2)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${value.toLocaleString('en-US', { maximumFractionDigits: 2 })}`;
}

function formatChainName(chain: string): string {
  return chain.charAt(0).toUpperCase() + chain.slice(1);
}

const COLLAPSED_COUNT = 8;

export function BridgeChart({ data, totalVolume, totalCount, volume24h }: BridgeChartProps) {
  const [expanded, setExpanded] = useState(false);

  if (!data || data.length === 0) {
    return (
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] p-6">
        <div className="flex items-center gap-2 mb-4">
          <ArrowLeftRight size={20} className="text-[var(--primary)]" />
          <h3 className="text-lg font-semibold text-[var(--text-primary)]">Bridge Analytics</h3>
        </div>
        <div className="flex items-center justify-center h-48 text-sm text-[var(--text-muted)]">
          No bridge transfers recorded yet.
        </div>
      </div>
    );
  }

  const sorted = [...data].sort((a, b) => b.volume - a.volume);
  const maxVolume = sorted[0]?.volume || 1;
  const visible = expanded ? sorted : sorted.slice(0, COLLAPSED_COUNT);
  const hiddenCount = sorted.length - COLLAPSED_COUNT;

  return (
    <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] p-6 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <ArrowLeftRight size={20} className="text-[var(--primary)]" />
          <h3 className="text-lg font-semibold text-[var(--text-primary)]">Bridge Analytics</h3>
        </div>
        <div className="flex gap-4 text-sm">
          <div className="text-right">
            <p className="text-[var(--text-muted)]">Total Volume</p>
            <p className="text-[var(--text-primary)] font-semibold tabular-nums">{formatUSD(totalVolume)}</p>
          </div>
          <div className="text-right">
            <p className="text-[var(--text-muted)]">24h</p>
            <p className="text-[var(--text-primary)] font-semibold tabular-nums">{formatUSD(volume24h)}</p>
          </div>
          <div className="text-right">
            <p className="text-[var(--text-muted)]">Transfers</p>
            <p className="text-[var(--text-primary)] font-semibold tabular-nums">{totalCount.toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className="space-y-2.5 flex-1">
        {visible.map((entry) => {
          const share = (entry.volume / maxVolume) * 100;
          return (
            <div key={entry.chain}>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-[var(--text-secondary)]">{formatChainName(entry.chain)}</span>
                <span className="text-[var(--text-primary)] tabular-nums">
                  {formatUSD(entry.volume)}
                  <span className="text-[var(--text-muted)] text-xs ml-2">
                    {entry.count.toLocaleString()} tx
                  </span>
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-[var(--surface-elevated)]/60">
                <div
                  className="h-1.5 rounded-full"
                  style={{
                    width: `${Math.max(share, 1.5)}%`,
                    backgroundColor: getChainColor(entry.chain),
                    opacity: 0.85,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {hiddenCount > 0 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-3 text-xs font-medium text-[var(--primary)] hover:opacity-80 transition-opacity self-start"
        >
          {expanded ? 'Show less' : `Show ${hiddenCount} more chains`}
        </button>
      )}

      <p className="flex items-center gap-1.5 mt-4 pt-3 border-t border-[var(--border)]/50 text-xs text-[var(--text-muted)]">
        <Info size={12} className="shrink-0" />
        Bridge tracking began July 2, 2026 — transfers made before then aren&apos;t included.
      </p>
    </div>
  );
}
