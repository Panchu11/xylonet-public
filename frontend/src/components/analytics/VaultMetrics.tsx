'use client';

import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import { Vault, TrendingUp } from 'lucide-react';

interface VaultDataPoint {
  date: string;
  tvl: number;
  deposits?: number;
  withdrawals?: number;
}

interface VaultMetricsProps {
  data: VaultDataPoint[];
  currentTVL: number;
  currentAPY?: number;
  totalDeposits?: number;
  totalWithdrawals?: number;
}

function formatUSD(value: number): string {
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(2)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${value.toFixed(0)}`;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function VaultMetrics({
  data,
  currentTVL,
  currentAPY,
  totalDeposits,
  totalWithdrawals,
}: VaultMetricsProps) {
  const hasData = data && data.length > 0;

  const chartData = hasData
    ? [...data]
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .map((d) => ({
          date: formatDate(d.date),
          tvl: d.tvl,
          deposits: d.deposits || 0,
          withdrawals: d.withdrawals || 0,
        }))
    : [];

  return (
    <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Vault size={20} className="text-[var(--primary)]" />
          <h3 className="text-lg font-semibold text-[var(--text-primary)]">Vault Metrics</h3>
        </div>
        <div className="flex gap-4 text-sm">
          <div className="text-right">
            <p className="text-[var(--text-muted)]">Current TVL</p>
            <p className="text-[var(--text-primary)] font-semibold tabular-nums">{formatUSD(currentTVL)}</p>
          </div>
          {totalDeposits !== undefined && (
            <div className="text-right hidden sm:block">
              <p className="text-[var(--text-muted)]">Deposits</p>
              <p className="text-emerald-400 font-semibold tabular-nums">{formatUSD(totalDeposits)}</p>
            </div>
          )}
          {totalWithdrawals !== undefined && (
            <div className="text-right hidden sm:block">
              <p className="text-[var(--text-muted)]">Withdrawals</p>
              <p className="text-rose-400 font-semibold tabular-nums">{formatUSD(totalWithdrawals)}</p>
            </div>
          )}
          {currentAPY !== undefined && (
            <div className="text-right">
              <p className="text-[var(--text-muted)]">APY</p>
              <p className="text-[var(--primary)] font-semibold tabular-nums">{currentAPY.toFixed(2)}%</p>
            </div>
          )}
        </div>
      </div>

      {hasData ? (
        <>
        <p className="text-xs text-[var(--text-muted)] mb-2">
          Cumulative net deposits over time. Current TVL reflects the live
          on-chain vault balance (includes yield and direct transfers).
        </p>
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
            <defs>
              <linearGradient id="vaultTvlGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#01C38E" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#01C38E" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.3} />
            <XAxis
              dataKey="date"
              stroke="var(--text-muted)"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="var(--text-muted)"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(val) => formatUSD(val)}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--card-bg)',
                border: '1px solid var(--card-border)',
                borderRadius: '8px',
                color: 'var(--text-primary)',
                fontSize: '13px',
              }}
              labelStyle={{ color: 'var(--text-muted)' }}
              formatter={(value, name) => {
                // The plotted series is cumulative net deposits (deposits −
                // withdrawals), not the live on-chain TVL — label it honestly.
                const label = name === 'tvl' ? 'Net deposits' : String(name).charAt(0).toUpperCase() + String(name).slice(1);
                return [formatUSD(Number(value)), label];
              }}
            />
            <Area
              type="monotone"
              dataKey="tvl"
              stroke="#01C38E"
              strokeWidth={2}
              fill="url(#vaultTvlGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center h-48 text-[var(--text-muted)]">
          <TrendingUp size={32} className="mb-3 opacity-40" />
          <p className="text-sm">Connect Envio indexer to see vault TVL growth.</p>
        </div>
      )}
    </div>
  );
}
