'use client';

import { Database } from 'lucide-react';

interface PoolData {
  name: string;
  liquidity: number;
  volume24h: number;
  volume7d: number;
  feeApr: number;
}

interface PoolsTableProps {
  pools: PoolData[];
}

function formatUSD(value: number): string {
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(2)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${value.toLocaleString('en-US', { maximumFractionDigits: 2 })}`;
}

export function PoolsTable({ pools }: PoolsTableProps) {
  if (!pools || pools.length === 0) {
    return (
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] p-6">
        <div className="flex items-center gap-2 mb-4">
          <Database size={20} className="text-[var(--primary)]" />
          <h3 className="text-lg font-semibold text-[var(--text-primary)]">Pools</h3>
        </div>
        <div className="flex items-center justify-center h-32 text-[var(--text-muted)]">
          Connect Envio indexer to see live pool data.
        </div>
      </div>
    );
  }

  const totalLiquidity = pools.reduce((sum, p) => sum + p.liquidity, 0) || 1;

  return (
    <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Database size={20} className="text-[var(--primary)]" />
          <h3 className="text-lg font-semibold text-[var(--text-primary)]">Pools</h3>
        </div>
        <span className="text-sm text-[var(--text-muted)] tabular-nums">
          {formatUSD(totalLiquidity)} total liquidity
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--border)]">
              <th className="text-left py-3 px-3 text-[var(--text-muted)] font-medium">Pool</th>
              <th className="text-right py-3 px-3 text-[var(--text-muted)] font-medium">Liquidity</th>
              <th className="text-right py-3 px-3 text-[var(--text-muted)] font-medium">24h Volume</th>
              <th className="text-right py-3 px-3 text-[var(--text-muted)] font-medium">7d Volume</th>
              <th className="text-right py-3 px-3 text-[var(--text-muted)] font-medium">Fee APR</th>
            </tr>
          </thead>
          <tbody>
            {pools.map((pool) => {
              const share = (pool.liquidity / totalLiquidity) * 100;
              return (
                <tr
                  key={pool.name}
                  className="border-b border-[var(--border)]/50 hover:bg-[var(--surface-elevated)]/30 transition-colors"
                >
                  <td className="py-4 px-3">
                    <span className="font-medium text-[var(--text-primary)]">{pool.name}</span>
                  </td>
                  <td className="py-4 px-3 text-right">
                    <span className="text-[var(--text-secondary)] tabular-nums">
                      {formatUSD(pool.liquidity)}
                    </span>
                    <div className="mt-1.5 h-1 rounded-full bg-[var(--surface-elevated)]/60 w-24 ml-auto">
                      <div
                        className="h-1 rounded-full bg-[var(--primary)]/70"
                        style={{ width: `${Math.max(share, 2)}%` }}
                      />
                    </div>
                  </td>
                  <td className="py-4 px-3 text-right text-[var(--text-secondary)] tabular-nums">
                    {formatUSD(pool.volume24h)}
                  </td>
                  <td className="py-4 px-3 text-right text-[var(--text-secondary)] tabular-nums">
                    {formatUSD(pool.volume7d)}
                  </td>
                  <td className="py-4 px-3 text-right">
                    {pool.feeApr > 0 ? (
                      <span className="inline-block px-2 py-0.5 rounded-md bg-[var(--primary)]/10 text-[var(--primary)] font-semibold tabular-nums text-xs">
                        {pool.feeApr.toFixed(2)}%
                      </span>
                    ) : (
                      <span className="text-[var(--text-muted)]">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
