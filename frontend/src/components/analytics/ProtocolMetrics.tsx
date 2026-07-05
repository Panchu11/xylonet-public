'use client';

import { ArrowRightLeft, PiggyBank, Banknote, Gift } from 'lucide-react';

interface ProtocolMetricsProps {
  totalTransactions: number;
  transactions24h: number;
  avgSwapSize: number;
  vaultDeposits: number;
  vaultWithdrawals: number;
  avgTipSize: number;
}

function formatUSD(value: number): string {
  if (!Number.isFinite(value)) return '$0';
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(2)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${value.toLocaleString('en-US', { maximumFractionDigits: 2 })}`;
}

function formatNumber(value: number): string {
  if (!Number.isFinite(value)) return '0';
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(2)}B`;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return value.toLocaleString('en-US');
}

const cards = [
  { label: 'Total Transactions', icon: ArrowRightLeft, color: 'text-[var(--primary)]', bgGlow: 'from-[var(--primary)]/10 to-transparent' },
  { label: '24h Transactions', icon: ArrowRightLeft, color: 'text-blue-400', bgGlow: 'from-blue-500/10 to-transparent' },
  { label: 'Avg Swap Size', icon: Banknote, color: 'text-emerald-400', bgGlow: 'from-emerald-500/10 to-transparent' },
  { label: 'Vault Deposits', icon: PiggyBank, color: 'text-amber-400', bgGlow: 'from-amber-500/10 to-transparent' },
  { label: 'Vault Withdrawals', icon: PiggyBank, color: 'text-rose-400', bgGlow: 'from-rose-500/10 to-transparent' },
  { label: 'Avg Tip Size', icon: Gift, color: 'text-purple-400', bgGlow: 'from-purple-500/10 to-transparent' },
];

export function ProtocolMetrics({
  totalTransactions,
  transactions24h,
  avgSwapSize,
  vaultDeposits,
  vaultWithdrawals,
  avgTipSize,
}: ProtocolMetricsProps) {
  const values = [
    formatNumber(totalTransactions),
    formatNumber(transactions24h),
    formatUSD(avgSwapSize),
    formatUSD(vaultDeposits),
    formatUSD(vaultWithdrawals),
    formatUSD(avgTipSize),
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className="relative overflow-hidden rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] p-5 transition-all duration-300 hover:border-[var(--primary)]/30 hover:shadow-lg hover:shadow-[var(--primary)]/5"
          >
            <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl ${card.bgGlow} rounded-full blur-2xl opacity-60`} />

            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <div className={`p-1.5 rounded-md bg-[var(--surface-elevated)]/50 ${card.color}`}>
                  <Icon size={16} />
                </div>
                <span className="text-xs text-[var(--text-muted)] font-medium">
                  {card.label}
                </span>
              </div>
              <p className="text-xl lg:text-2xl font-bold text-[var(--text-primary)] tabular-nums">
                {values[idx]}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
