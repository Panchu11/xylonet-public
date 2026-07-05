import { Trophy, ExternalLink } from 'lucide-react';

export interface TopTrader {
  address: string;
  /** Lifetime swap volume in whole USDC */
  volume: number;
  swapCount: number;
}

interface TopTradersProps {
  traders: TopTrader[];
  explorerUrl: string;
}

function formatUSD(value: number): string {
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(2)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${value.toLocaleString('en-US', { maximumFractionDigits: 2 })}`;
}

function formatCount(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return value.toLocaleString('en-US');
}

function truncateAddress(addr: string): string {
  if (addr.length <= 12) return addr;
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

export function TopTraders({ traders, explorerUrl }: TopTradersProps) {
  return (
    <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] p-6">
      <div className="flex items-center gap-2 mb-4">
        <Trophy size={20} className="text-[var(--primary)]" />
        <h3 className="text-lg font-semibold text-[var(--text-primary)]">Top Traders</h3>
      </div>

      {traders.length === 0 ? (
        <div className="flex items-center justify-center h-32 text-sm text-[var(--text-muted)]">
          Trader rankings will appear as swaps flow in.
        </div>
      ) : (
        <div className="space-y-2">
          {traders.map((trader, idx) => (
            <a
              key={trader.address}
              href={`${explorerUrl}/address/${trader.address}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-between py-2 px-3 rounded-lg bg-[var(--surface-elevated)]/30 hover:bg-[var(--surface-elevated)]/60 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="shrink-0 text-xs font-bold text-[var(--text-muted)] w-5">
                  #{idx + 1}
                </span>
                <span className="text-sm font-mono text-[var(--text-secondary)] truncate">
                  {truncateAddress(trader.address)}
                </span>
                <ExternalLink
                  size={11}
                  className="shrink-0 text-[var(--text-muted)] opacity-0 group-hover:opacity-100 transition-opacity"
                />
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-semibold text-[var(--primary)] tabular-nums">
                  {formatUSD(trader.volume)}
                </p>
                <p className="text-xs text-[var(--text-muted)] tabular-nums">
                  {formatCount(trader.swapCount)} swaps
                </p>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
