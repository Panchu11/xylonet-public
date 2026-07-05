'use client';

import { useState, useEffect, useCallback } from 'react';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface PayXStats {
  total_volume: number;
  total_tips: number;
  total_users: number;
  unique_tippers: number;
  unique_recipients: number;
  volume_24h: number;
  tips_24h: number;
  avg_tip: number;
  updated_at: string;
}

export interface RecentTip {
  id: string;
  from: string;
  fromFull: string;
  to: string;
  toHandle: string;
  amount: string;
  amountRaw: number;
  message: string | null;
  timestamp: string;
  timeAgo: string;
  txHash: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// HOOK: usePayXStats
// Fetch real-time PayX statistics
// ═══════════════════════════════════════════════════════════════════════════

export function usePayXStats(refreshInterval: number = 30000) {
  const [stats, setStats] = useState<PayXStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      // Fetch stats from Supabase (cron handles blockchain syncing)
      const res = await fetch('/api/payx/stats?source=supabase');
      const data = await res.json();

      if (data.success && data.data && data.data.total_tips > 0) {
        setStats(data.data);
        setError(null);
      } else {
        // Fallback: Fetch directly from blockchain if Supabase has no data
        console.log('[usePayXStats] Supabase empty, falling back to blockchain');
        const blockchainRes = await fetch('/api/payx/stats?source=blockchain');
        const blockchainData = await blockchainRes.json();
        
        if (blockchainData.success && blockchainData.data) {
          setStats(blockchainData.data);
          setError(null);
        } else {
          // Final fallback to zero stats
          setStats({
            total_volume: 0,
            total_tips: 0,
            total_users: 0,
            unique_tippers: 0,
            unique_recipients: 0,
            volume_24h: 0,
            tips_24h: 0,
            avg_tip: 0,
            updated_at: new Date().toISOString(),
          });
        }
      }
    } catch (err: any) {
      console.error('[usePayXStats] Error:', err);
      setError(err.message);
      setStats({
        total_volume: 0,
        total_tips: 0,
        total_users: 0,
        unique_tippers: 0,
        unique_recipients: 0,
        volume_24h: 0,
        tips_24h: 0,
        avg_tip: 0,
        updated_at: new Date().toISOString(),
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();

    // Set up auto-refresh
    if (refreshInterval > 0) {
      const interval = setInterval(fetchStats, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [fetchStats, refreshInterval]);

  return { stats, loading, error, refresh: fetchStats };
}

// ═══════════════════════════════════════════════════════════════════════════
// HOOK: useRecentTips
// Fetch recent tips for live activity feed
// ═══════════════════════════════════════════════════════════════════════════

export function useRecentTips(limit: number = 10, refreshInterval: number = 10000) {
  const [tips, setTips] = useState<RecentTip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTips = useCallback(async () => {
    try {
      const res = await fetch(`/api/payx/recent-tips?limit=${limit}`);
      const data = await res.json();

      if (data.success && data.data) {
        setTips(data.data);
        setError(null);
      } else {
        setTips([]);
      }
    } catch (err: any) {
      console.error('[useRecentTips] Error:', err);
      setError(err.message);
      setTips([]);
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchTips();

    // Set up auto-refresh for real-time feel
    if (refreshInterval > 0) {
      const interval = setInterval(fetchTips, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [fetchTips, refreshInterval]);

  return { tips, loading, error, refresh: fetchTips };
}

// ═══════════════════════════════════════════════════════════════════════════
// HOOK: useIndexer
// Trigger blockchain event indexing
// ═══════════════════════════════════════════════════════════════════════════

export function useIndexer() {
  const [indexing, setIndexing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const runIndexer = useCallback(async () => {
    setIndexing(true);
    setError(null);

    try {
      const res = await fetch('/api/payx/stats', {
        method: 'POST',
      });
      const data = await res.json();

      if (data.success) {
        setResult(data);
      } else {
        setError(data.error || 'Indexing failed');
      }
    } catch (err: any) {
      console.error('[useIndexer] Error:', err);
      setError(err.message);
    } finally {
      setIndexing(false);
    }
  }, []);

  return { runIndexer, indexing, result, error };
}

// ═══════════════════════════════════════════════════════════════════════════
// FORMATTING HELPERS
// ═══════════════════════════════════════════════════════════════════════════

export function formatVolume(amount: number): string {
  if (amount >= 1000000) {
    return `$${(amount / 1000000).toFixed(1)}M`;
  }
  if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(1)}K`;
  }
  return `$${amount.toFixed(2)}`;
}

export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toLocaleString();
}

export function formatAvgTip(amount: number): string {
  return `$${amount.toFixed(2)}`;
}

// Generate avatar colors based on address/handle
export function getAvatarGradient(seed: string): string {
  const gradients = [
    'from-[#0A786A] to-[#01C38E]',
    'from-[#132D46] to-[#01C38E]',
    'from-[#132D46] to-[#0A786A]',
    'from-[#01C38E] to-[#0A786A]',
    'from-orange-500 to-yellow-500',
    'from-[#0A786A] to-[#01C38E]',
    'from-[#0A786A] to-[#132D46]',
    'from-amber-500 to-orange-500',
  ];
  
  // Simple hash of seed to get consistent color
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash) + seed.charCodeAt(i);
    hash = hash & hash;
  }
  
  return gradients[Math.abs(hash) % gradients.length];
}
