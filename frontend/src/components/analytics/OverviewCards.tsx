'use client';

import { TrendingUp, TrendingDown, Users, DollarSign, Layers } from 'lucide-react';

interface OverviewCardsProps {
  tvl: number;
  volume24h: number;
  totalUsers: number;
  feeRevenue: number;
  /** % change of the rolling 24h volume vs. the previous 24h window */
  volumeChangePct?: number;
  /** Breakdown shown under the TVL number, e.g. "Vault $7.8M · Pools $8.5M" */
  tvlBreakdown?: string;
}

function formatUSD(value: number): string {
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(2)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${value.toLocaleString('en-US', { maximumFractionDigits: 2 })}`;
}

function formatNumber(value: number): string {
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(2)}B`;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return value.toLocaleString('en-US');
}

function DeltaChip({ pct }: { pct: number }) {
  const up = pct >= 0;
  const Icon = up ? TrendingUp : TrendingDown;
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-medium tabular-nums ${
        up ? 'text-emerald-400' : 'text-rose-400'
      }`}
    >
      <Icon size={12} />
      {Math.abs(pct).toFixed(1)}% · 24h
    </span>
  );
}

export function OverviewCards({
  tvl,
  volume24h,
  totalUsers,
  feeRevenue,
  volumeChangePct,
  tvlBreakdown,
}: OverviewCardsProps) {
  const cards = [
    {
      label: 'Total Value Locked',
      icon: Layers,
      color: 'text-[var(--primary)]',
      value: formatUSD(tvl),
      sub: tvlBreakdown ? (
        <span className="text-xs text-[var(--text-muted)]/70 tabular-nums">{tvlBreakdown}</span>
      ) : null,
    },
    {
      label: '24h Volume',
      icon: TrendingUp,
      color: 'text-blue-400',
      value: formatUSD(volume24h),
      sub:
        volumeChangePct !== undefined && Number.isFinite(volumeChangePct) ? (
          <DeltaChip pct={volumeChangePct} />
        ) : null,
    },
    {
      label: 'Total Users',
      icon: Users,
      color: 'text-purple-400',
      value: formatNumber(totalUsers),
      sub: (
        <span className="text-xs text-[var(--text-muted)]/70">
          Unique wallets across all contracts
        </span>
      ),
    },
    {
      label: 'Fee Revenue',
      icon: DollarSign,
      color: 'text-amber-400',
      value: formatUSD(feeRevenue),
      sub: <span className="text-xs text-[var(--text-muted)]/70">All-time protocol fees</span>,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className="rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] p-5 transition-all duration-300 hover:border-[var(--primary)]/30"
          >
            <div className="flex items-center gap-2 mb-3">
              <div className={`p-1.5 rounded-md bg-[var(--surface-elevated)]/50 ${card.color}`}>
                <Icon size={16} />
              </div>
              <span className="text-sm text-[var(--text-muted)] font-medium">{card.label}</span>
            </div>
            <p className="text-2xl lg:text-3xl font-bold text-[var(--text-primary)] tabular-nums">
              {card.value}
            </p>
            {card.sub && <div className="mt-1.5">{card.sub}</div>}
          </div>
        );
      })}
    </div>
  );
}
