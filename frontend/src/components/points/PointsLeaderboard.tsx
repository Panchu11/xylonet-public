'use client';

import { useState, useEffect } from 'react';

interface LeaderboardEntry {
  id: string;
  wallet_address: string;
  wallet_display: string;
  total_points: number;
  volume_points: number;
  milestone_points: number;
  consistency_points: number;
  referral_points: number;
  diversity_multiplier: number;
  successful_referrals: number;
  products_used: number;
  active_days: number;
  rank: number;
}

interface LeaderboardData {
  leaderboard: LeaderboardEntry[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    has_more: boolean;
  };
  user_rank: {
    rank: number;
    total_points: number;
    wallet_address: string;
  } | null;
  stats: {
    total_participants: number;
    total_points_distributed: number;
  };
}

interface PointsLeaderboardProps {
  wallet: string | undefined;
}

export default function PointsLeaderboard({ wallet }: PointsLeaderboardProps) {
  const [data, setData] = useState<LeaderboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const limit = 20;

  useEffect(() => {
    async function fetchLeaderboard() {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          limit: limit.toString(),
          offset: (page * limit).toString(),
        });
        
        if (wallet) {
          params.append('wallet', wallet);
        }

        const res = await fetch(`/api/points/leaderboard?${params}`);
        const json = await res.json();
        
        if (json.success) {
          setData(json.data);
        }
      } catch (error) {
        console.error('Failed to fetch leaderboard:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchLeaderboard();
  }, [wallet, page]);

  if (loading && !data) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-[#01C38E]/30 rounded-full" />
          <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-t-[#01C38E] rounded-full animate-spin" />
        </div>
        <p className="text-gray-400 animate-pulse">Loading leaderboard...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-[#0A786A]/50 to-[#01C38E]/50 rounded-2xl blur opacity-20" />
        <div className="relative bg-[#12131a]/80 backdrop-blur-xl rounded-2xl p-12 border border-white/10 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center">
            <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p className="text-gray-400">Failed to load leaderboard</p>
        </div>
      </div>
    );
  }

  const getRankDisplay = (rank: number) => {
    switch (rank) {
      case 1:
        return (
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center shadow-lg shadow-yellow-500/30">
            <span className="text-lg">🥇</span>
          </div>
        );
      case 2:
        return (
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-300 to-gray-500 flex items-center justify-center shadow-lg shadow-gray-400/30">
            <span className="text-lg">🥈</span>
          </div>
        );
      case 3:
        return (
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-amber-700 flex items-center justify-center shadow-lg shadow-orange-500/30">
            <span className="text-lg">🥉</span>
          </div>
        );
      default:
        return (
          <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
            <span className="text-gray-400 font-bold text-sm">#{rank}</span>
          </div>
        );
    }
  };

  const isCurrentUser = (address: string) => {
    return wallet?.toLowerCase() === address.toLowerCase();
  };

  const getDiversityColor = (multiplier: number) => {
    if (multiplier >= 1.5) return 'from-yellow-400 to-amber-500 text-yellow-400';
    if (multiplier >= 1.25) return 'from-[#0A786A] to-[#01C38E] text-[#01C38E]';
    return 'from-gray-400 to-slate-500 text-gray-400';
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Participants */}
        <div className="relative group h-full">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-[#0A786A] to-[#01C38E] rounded-xl blur opacity-10 group-hover:opacity-20 transition duration-300" />
          <div className="relative h-full bg-gradient-to-br from-[#0A786A]/10 to-[#01C38E]/10 backdrop-blur-xl rounded-xl p-5 border border-[#01C38E]/20 flex flex-col justify-between">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-[#01C38E]" />
              <p className="text-gray-400 text-xs uppercase tracking-wider">Participants</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-white">{data.stats.total_participants.toLocaleString()}</p>
              <p className="text-sm text-gray-500 mt-1">active users</p>
            </div>
          </div>
        </div>

        {/* Total Points */}
        <div className="relative group h-full">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-[#132D46] to-[#0A786A] rounded-xl blur opacity-10 group-hover:opacity-20 transition duration-300" />
          <div className="relative h-full bg-gradient-to-br from-[#132D46]/10 to-[#0A786A]/10 backdrop-blur-xl rounded-xl p-5 border border-[#0A786A]/20 flex flex-col justify-between">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-[#01C38E]" />
              <p className="text-gray-400 text-xs uppercase tracking-wider">Points Distributed</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-white">
                {data.stats.total_points_distributed >= 1000000 
                  ? `${(data.stats.total_points_distributed / 1000000).toFixed(2)}M`
                  : data.stats.total_points_distributed.toLocaleString()}
              </p>
              <p className="text-sm text-gray-500 mt-1">total earned</p>
            </div>
          </div>
        </div>

        {/* Your Rank */}
        {data.user_rank && (
          <div className="relative group h-full">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-[#0A786A] to-[#01C38E] rounded-xl blur opacity-10 group-hover:opacity-20 transition duration-300" />
            <div className="relative h-full bg-gradient-to-br from-[#0A786A]/10 to-[#01C38E]/10 backdrop-blur-xl rounded-xl p-5 border border-[#0A786A]/20 flex flex-col justify-between">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-[#01C38E] animate-pulse" />
                <p className="text-gray-400 text-xs uppercase tracking-wider">Your Rank</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-white">#{data.user_rank.rank.toLocaleString()}</p>
                <p className="text-sm text-gray-500 mt-1">{data.user_rank.total_points.toLocaleString()} pts</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Leaderboard Table */}
      <div className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-[#0A786A]/30 to-[#01C38E]/30 rounded-xl blur opacity-10" />
        <div className="relative bg-[#12131a]/80 backdrop-blur-xl rounded-xl border border-white/10 overflow-hidden">
          {/* Header */}
          <div className="p-5 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#0A786A] to-[#01C38E] flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Leaderboard</h3>
                <p className="text-xs text-gray-500">Top performers by total points</p>
              </div>
            </div>
            {loading && (
              <div className="w-5 h-5 border-2 border-[#01C38E]/30 border-t-[#01C38E] rounded-full animate-spin" />
            )}
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5 bg-white/5">
                  <th className="px-5 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                  <th className="px-5 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-5 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Points</th>
                  <th className="px-5 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Activity</th>
                  <th className="px-5 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Milestones</th>
                  <th className="px-5 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Referrals</th>
                  <th className="px-5 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Diversity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {data.leaderboard.map((entry, index) => {
                  const isUser = isCurrentUser(entry.wallet_address);
                  const diversityColors = getDiversityColor(entry.diversity_multiplier || 1.0);
                  
                  return (
                    <tr
                      key={entry.id}
                      className={`transition-all duration-200 ${
                        isUser
                          ? 'bg-[#01C38E]/10 border-l-2 border-l-[#01C38E]'
                          : 'hover:bg-white/5'
                      }`}
                      style={{ animationDelay: `${index * 30}ms` }}
                    >
                      <td className="px-5 py-4">
                        {getRankDisplay(entry.rank)}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center ${
                            isUser 
                              ? 'bg-gradient-to-br from-[#0A786A] to-[#01C38E]' 
                              : 'bg-gradient-to-br from-gray-600 to-gray-700'
                          }`}>
                            <span className="text-white font-bold text-xs">
                              {entry.wallet_display.slice(0, 2).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <span className={`font-mono text-sm ${isUser ? 'text-[#01C38E]' : 'text-white'}`}>
                              {entry.wallet_display}
                            </span>
                            {isUser && (
                              <span className="ml-2 px-2 py-0.5 bg-[#01C38E]/20 text-[#01C38E] text-[10px] rounded-full font-medium uppercase">
                                You
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <span className="text-white font-bold text-lg">{entry.total_points.toLocaleString()}</span>
                      </td>
                      <td className="px-5 py-4 text-right hidden md:table-cell">
                        <span className="text-gray-400">{entry.volume_points.toLocaleString()}</span>
                      </td>
                      <td className="px-5 py-4 text-right hidden md:table-cell">
                        <span className="text-gray-400">{entry.milestone_points.toLocaleString()}</span>
                      </td>
                      <td className="px-5 py-4 text-right hidden lg:table-cell">
                        <span className="text-gray-400">{entry.successful_referrals}</span>
                      </td>
                      <td className="px-5 py-4 text-right hidden lg:table-cell">
                        <div className="inline-flex items-center gap-1.5">
                          <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${diversityColors}`} />
                          <span className={diversityColors.split(' ').pop()}>
                            {(entry.diversity_multiplier || 1.0).toFixed(2)}x
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {data.pagination.total > limit && (
            <div className="px-5 py-4 border-t border-white/5 flex items-center justify-between">
              <p className="text-sm text-gray-500">
                Showing <span className="text-gray-300">{page * limit + 1}-{Math.min((page + 1) * limit, data.pagination.total)}</span> of <span className="text-gray-300">{data.pagination.total}</span>
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(p => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed text-white rounded-lg transition-all border border-white/10 disabled:border-white/5 text-sm font-medium"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage(p => p + 1)}
                  disabled={!data.pagination.has_more}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed text-white rounded-lg transition-all border border-white/10 disabled:border-white/5 text-sm font-medium"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Info Card */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#0A786A]/5 via-[#01C38E]/5 to-[#132D46]/5 rounded-xl p-5 border border-white/5">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#0A786A]/20 to-[#01C38E]/20 flex items-center justify-center flex-shrink-0 border border-[#01C38E]/20">
            <svg className="w-5 h-5 text-[#01C38E]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-white font-medium mb-1">About the Leaderboard</p>
            <p className="text-gray-400 text-sm leading-relaxed">
              Rankings are based on total points earned from all sources: on-chain activity, 
              milestones, first interactions, referrals, and social tasks. Quality score reflects 
              account health but doesn&apos;t directly affect rankings.
            </p>
          </div>
        </div>
        
        <div className="absolute -right-20 -bottom-20 w-40 h-40 bg-[#01C38E]/10 rounded-full blur-3xl" />
      </div>
    </div>
  );
}
