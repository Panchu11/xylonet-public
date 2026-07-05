'use client';

import { useState, useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface DailyData {
  date: string;
  swap_volume: number;
  bridge_volume: number;
  tip_volume: number;
}

interface VolumeChartProps {
  data: DailyData[];
  totalVolume?: number;
  volume7d?: number;
  volume30d?: number;
}

type TimeRange = '7d' | '30d' | 'all';

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

export function VolumeChart({ data, totalVolume, volume7d, volume30d }: VolumeChartProps) {
  const [range, setRange] = useState<TimeRange>('30d');

  const chartData = useMemo(() => {
    const sorted = [...data].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    let sliced = sorted;
    if (range === '7d') sliced = sorted.slice(-7);
    else if (range === '30d') sliced = sorted.slice(-30);

    return sliced.map((d) => ({
      date: formatDate(d.date),
      volume: d.swap_volume + d.bridge_volume + d.tip_volume,
      swaps: d.swap_volume,
      bridge: d.bridge_volume,
      tips: d.tip_volume,
    }));
  }, [data, range]);

  if (!data || data.length === 0) {
    return (
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] p-6">
        <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Volume Over Time</h3>
        <div className="flex items-center justify-center h-64 text-[var(--text-muted)]">
          No historical data yet — check back once transactions are flowing.
        </div>
      </div>
    );
  }

  const showVolumeStats =
    totalVolume !== undefined || volume7d !== undefined || volume30d !== undefined;

  return (
    <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h3 className="text-lg font-semibold text-[var(--text-primary)]">Volume Over Time</h3>
          {showVolumeStats && (
            <div className="flex flex-wrap gap-4 mt-2">
              {totalVolume !== undefined && (
                <div>
                  <p className="text-xs text-[var(--text-muted)]">Total Volume</p>
                  <p className="text-sm font-semibold text-[var(--text-primary)] tabular-nums">
                    {formatUSD(totalVolume)}
                  </p>
                </div>
              )}
              {volume7d !== undefined && (
                <div>
                  <p className="text-xs text-[var(--text-muted)]">7D Volume</p>
                  <p className="text-sm font-semibold text-[var(--text-primary)] tabular-nums">
                    {formatUSD(volume7d)}
                  </p>
                </div>
              )}
              {volume30d !== undefined && (
                <div>
                  <p className="text-xs text-[var(--text-muted)]">30D Volume</p>
                  <p className="text-sm font-semibold text-[var(--text-primary)] tabular-nums">
                    {formatUSD(volume30d)}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
        <div className="flex gap-1 bg-[var(--surface-elevated)] rounded-lg p-1 shrink-0">
          {(['7d', '30d', 'all'] as TimeRange[]).map((t) => (
            <button
              key={t}
              onClick={() => setRange(t)}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                range === t
                  ? 'bg-[var(--primary)] text-white'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              {t === 'all' ? 'All' : t.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
          <defs>
            <linearGradient id="volumeGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#01C38E" stopOpacity={0.3} />
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
            formatter={(value) => [formatUSD(Number(value)), 'Volume']}
          />
          <Area
            type="monotone"
            dataKey="volume"
            stroke="#01C38E"
            strokeWidth={2}
            fill="url(#volumeGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
