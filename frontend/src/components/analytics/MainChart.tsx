'use client';

import { useState, useMemo } from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export interface MainChartPoint {
  /** UTC calendar date, YYYY-MM-DD (ascending) */
  date: string;
  swapVolume: number;
  bridgeVolume: number;
  tipVolume: number;
  /** Total transactions that day (swaps + tips + vault events) */
  transactions: number;
  /** Cumulative vault net deposits as of that day */
  vaultNet: number;
}

interface MainChartProps {
  data: MainChartPoint[];
  totalVolume: number;
  volume7d: number;
  volume30d: number;
}

type Tab = 'volume' | 'transactions' | 'tvl';
type TimeRange = '7d' | '30d' | '90d' | 'all';

const TABS: { key: Tab; label: string }[] = [
  { key: 'volume', label: 'Volume' },
  { key: 'transactions', label: 'Transactions' },
  { key: 'tvl', label: 'Vault TVL' },
];

const RANGES: { key: TimeRange; label: string }[] = [
  { key: '7d', label: '7D' },
  { key: '30d', label: '30D' },
  { key: '90d', label: '90D' },
  { key: 'all', label: 'All' },
];

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatUSD(value: number): string {
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(2)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  return `$${value.toFixed(0)}`;
}

function formatCount(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return value.toLocaleString('en-US');
}

const tooltipStyle = {
  backgroundColor: 'var(--card-bg)',
  border: '1px solid var(--card-border)',
  borderRadius: '8px',
  color: 'var(--text-primary)',
  fontSize: '13px',
};

export function MainChart({ data, totalVolume, volume7d, volume30d }: MainChartProps) {
  const [tab, setTab] = useState<Tab>('volume');
  const [range, setRange] = useState<TimeRange>('30d');

  const chartData = useMemo(() => {
    let sliced = data;
    if (range === '7d') sliced = data.slice(-7);
    else if (range === '30d') sliced = data.slice(-30);
    else if (range === '90d') sliced = data.slice(-90);
    return sliced.map((d) => ({ ...d, label: formatDate(d.date) }));
  }, [data, range]);

  if (!data || data.length === 0) {
    return (
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] p-6">
        <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Protocol Activity</h3>
        <div className="flex items-center justify-center h-64 text-[var(--text-muted)]">
          No historical data yet — check back once transactions are flowing.
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] p-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-2">
        <div className="flex gap-1 bg-[var(--surface-elevated)] rounded-lg p-1">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                tab === t.key
                  ? 'bg-[var(--primary)] text-white'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="flex gap-1 bg-[var(--surface-elevated)] rounded-lg p-1 shrink-0">
          {RANGES.map((r) => (
            <button
              key={r.key}
              onClick={() => setRange(r.key)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                range === r.key
                  ? 'bg-[var(--primary)] text-white'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {tab === 'volume' && (
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mb-4">
          <div>
            <p className="text-xs text-[var(--text-muted)]">Total Volume</p>
            <p className="text-sm font-semibold text-[var(--text-primary)] tabular-nums">
              {formatUSD(totalVolume)}
            </p>
          </div>
          <div>
            <p className="text-xs text-[var(--text-muted)]">7D</p>
            <p className="text-sm font-semibold text-[var(--text-primary)] tabular-nums">
              {formatUSD(volume7d)}
            </p>
          </div>
          <div>
            <p className="text-xs text-[var(--text-muted)]">30D</p>
            <p className="text-sm font-semibold text-[var(--text-primary)] tabular-nums">
              {formatUSD(volume30d)}
            </p>
          </div>
          <div className="flex items-center gap-4 ml-auto text-xs text-[var(--text-muted)]">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-sm bg-[#01C38E]" /> Swaps
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-sm bg-[#378ADD]" /> Bridge
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-sm bg-[#EF9F27]" /> Tips
            </span>
          </div>
        </div>
      )}
      {tab === 'transactions' && (
        <p className="text-xs text-[var(--text-muted)] mb-4 mt-2">
          Daily on-chain transactions across swaps, tips, and vault activity.
        </p>
      )}
      {tab === 'tvl' && (
        <p className="text-xs text-[var(--text-muted)] mb-4 mt-2">
          Cumulative vault net deposits (deposits − withdrawals) over time.
        </p>
      )}

      <ResponsiveContainer width="100%" height={300}>
        {tab === 'transactions' ? (
          <BarChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.3} />
            <XAxis dataKey="label" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis
              stroke="var(--text-muted)"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(val) => formatCount(Number(val))}
            />
            <Tooltip
              contentStyle={tooltipStyle}
              labelStyle={{ color: 'var(--text-muted)' }}
              formatter={(value) => [formatCount(Number(value)), 'Transactions']}
            />
            <Bar dataKey="transactions" fill="#01C38E" fillOpacity={0.85} radius={[3, 3, 0, 0]} />
          </BarChart>
        ) : tab === 'tvl' ? (
          <AreaChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
            <defs>
              <linearGradient id="mainTvlGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#01C38E" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#01C38E" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.3} />
            <XAxis dataKey="label" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis
              stroke="var(--text-muted)"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(val) => formatUSD(Number(val))}
            />
            <Tooltip
              contentStyle={tooltipStyle}
              labelStyle={{ color: 'var(--text-muted)' }}
              formatter={(value) => [formatUSD(Number(value)), 'Net deposits']}
            />
            <Area type="monotone" dataKey="vaultNet" stroke="#01C38E" strokeWidth={2} fill="url(#mainTvlGradient)" />
          </AreaChart>
        ) : (
          <AreaChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
            <defs>
              <linearGradient id="swapGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#01C38E" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#01C38E" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="bridgeGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#378ADD" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#378ADD" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="tipGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#EF9F27" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#EF9F27" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.3} />
            <XAxis dataKey="label" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis
              stroke="var(--text-muted)"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(val) => formatUSD(Number(val))}
            />
            <Tooltip
              contentStyle={tooltipStyle}
              labelStyle={{ color: 'var(--text-muted)' }}
              formatter={(value, name) => {
                const labels: Record<string, string> = {
                  swapVolume: 'Swaps',
                  bridgeVolume: 'Bridge',
                  tipVolume: 'Tips',
                };
                return [formatUSD(Number(value)), labels[String(name)] ?? String(name)];
              }}
            />
            <Area
              type="monotone"
              dataKey="swapVolume"
              stackId="vol"
              stroke="#01C38E"
              strokeWidth={2}
              fill="url(#swapGradient)"
            />
            <Area
              type="monotone"
              dataKey="bridgeVolume"
              stackId="vol"
              stroke="#378ADD"
              strokeWidth={2}
              fill="url(#bridgeGradient)"
            />
            <Area
              type="monotone"
              dataKey="tipVolume"
              stackId="vol"
              stroke="#EF9F27"
              strokeWidth={2}
              fill="url(#tipGradient)"
            />
          </AreaChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}
