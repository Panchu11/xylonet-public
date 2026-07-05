import { Activity, ExternalLink } from 'lucide-react';

export interface ActivityItem {
  /** Unique key (event id) */
  id: string;
  type: 'swap' | 'tip' | 'deposit' | 'withdraw';
  txHash: string;
  /** Unix seconds */
  timestamp: number;
  /** e.g. "$67.10 USDC → EURC" */
  title: string;
}

interface ActivityFeedProps {
  items: ActivityItem[];
  explorerUrl: string;
  /** Server render time (unix seconds) used for relative timestamps */
  renderedAt: number;
}

const TYPE_STYLES: Record<ActivityItem['type'], { label: string; className: string }> = {
  swap: { label: 'Swap', className: 'bg-[var(--primary)]/10 text-[var(--primary)]' },
  tip: { label: 'Tip', className: 'bg-amber-500/10 text-amber-400' },
  deposit: { label: 'Deposit', className: 'bg-emerald-500/10 text-emerald-400' },
  withdraw: { label: 'Withdraw', className: 'bg-rose-500/10 text-rose-400' },
};

function relativeTime(timestamp: number, now: number): string {
  const diff = Math.max(now - timestamp, 0);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function truncateHash(hash: string): string {
  if (hash.length <= 14) return hash;
  return `${hash.slice(0, 8)}…${hash.slice(-4)}`;
}

export function ActivityFeed({ items, explorerUrl, renderedAt }: ActivityFeedProps) {
  return (
    <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] p-6">
      <div className="flex items-center gap-2 mb-4">
        <Activity size={20} className="text-[var(--primary)]" />
        <h3 className="text-lg font-semibold text-[var(--text-primary)]">Recent Activity</h3>
      </div>

      {items.length === 0 ? (
        <div className="flex items-center justify-center h-32 text-sm text-[var(--text-muted)]">
          No recent on-chain activity.
        </div>
      ) : (
        <div>
          {items.map((item, idx) => {
            const style = TYPE_STYLES[item.type];
            return (
              <a
                key={item.id}
                href={`${explorerUrl}/tx/${item.txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className={`group flex items-center gap-3 py-2.5 px-2 -mx-2 rounded-lg hover:bg-[var(--surface-elevated)]/30 transition-colors ${
                  idx > 0 ? 'border-t border-[var(--border)]/40' : ''
                }`}
              >
                <span
                  className={`shrink-0 w-[4.5rem] text-center text-xs font-medium px-2 py-1 rounded-full ${style.className}`}
                >
                  {style.label}
                </span>
                <span className="flex-1 min-w-0 truncate text-sm text-[var(--text-primary)] tabular-nums">
                  {item.title}
                </span>
                <span className="hidden sm:inline shrink-0 text-xs font-mono text-[var(--text-muted)]">
                  {truncateHash(item.txHash)}
                </span>
                <span className="shrink-0 text-xs text-[var(--text-muted)] tabular-nums w-14 text-right">
                  {relativeTime(item.timestamp, renderedAt)}
                </span>
                <ExternalLink
                  size={12}
                  className="shrink-0 text-[var(--text-muted)] opacity-0 group-hover:opacity-100 transition-opacity"
                />
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}
