'use client';

import { ReactNode } from 'react';
import { MILESTONE_CONFIG } from '@/lib/points';

interface MilestoneTrackerProps {
  data: {
    volumes: {
      swap: number;
      vault: number;
      payx_sent: number;
      payx_received: number;
    };
    milestones: Array<{
      category: string;
      tier: string;
      points_awarded: number;
      achieved_at: string;
    }>;
  } | null;
}

type MilestoneCategory = 'swap' | 'vault' | 'payx_sent' | 'payx_received';

export default function MilestoneTracker({ data }: MilestoneTrackerProps) {
  if (!data) {
    return (
      <div className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-600/50 to-orange-600/50 rounded-2xl blur opacity-20" />
        <div className="relative bg-[#12131a]/80 backdrop-blur-xl rounded-2xl p-12 border border-white/10">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gray-800 animate-pulse" />
            <div className="h-4 w-48 bg-gray-800 rounded animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  const categories: Array<{
    id: MilestoneCategory;
    name: string;
    volume: number;
    gradient: string;
    bgGradient: string;
    borderColor: string;
    icon: ReactNode;
  }> = [
    { 
      id: 'swap', 
      name: 'Swap', 
      volume: data.volumes.swap, 
      gradient: 'from-[#0A786A] to-[#01C38E]',
      bgGradient: 'from-[#0A786A]/10 to-[#01C38E]/10',
      borderColor: 'border-[#01C38E]/20',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      ),
    },
    { 
      id: 'vault', 
      name: 'Vault', 
      volume: data.volumes.vault, 
      gradient: 'from-[#0A786A] to-[#01C38E]',
      bgGradient: 'from-[#0A786A]/10 to-[#01C38E]/10',
      borderColor: 'border-[#0A786A]/20',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ),
    },
    { 
      id: 'payx_sent', 
      name: 'PayX Sent', 
      volume: data.volumes.payx_sent, 
      gradient: 'from-[#132D46] to-[#0A786A]',
      bgGradient: 'from-[#132D46]/10 to-[#0A786A]/10',
      borderColor: 'border-[#0A786A]/20',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    { 
      id: 'payx_received', 
      name: 'PayX Received', 
      volume: data.volumes.payx_received || 0, 
      gradient: 'from-[#132D46] to-[#0A786A]',
      bgGradient: 'from-[#132D46]/10 to-[#0A786A]/10',
      borderColor: 'border-[#0A786A]/20',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      ),
    },
  ];

  const tierStyles: Record<string, { gradient: string; border: string; glow: string; icon: ReactNode }> = {
    bronze: {
      gradient: 'from-orange-400 to-amber-600',
      border: 'border-orange-500/40',
      glow: 'shadow-orange-500/20',
      icon: <span className="text-lg">🥉</span>,
    },
    silver: {
      gradient: 'from-gray-300 to-gray-500',
      border: 'border-gray-400/40',
      glow: 'shadow-gray-400/20',
      icon: <span className="text-lg">🥈</span>,
    },
    gold: {
      gradient: 'from-yellow-400 to-amber-500',
      border: 'border-yellow-500/40',
      glow: 'shadow-yellow-500/20',
      icon: <span className="text-lg">🥇</span>,
    },
    platinum: {
      gradient: 'from-cyan-400 to-teal-500',
      border: 'border-cyan-500/40',
      glow: 'shadow-cyan-500/20',
      icon: <span className="text-lg">💎</span>,
    },
    diamond: {
      gradient: 'from-[#0A786A] to-[#01C38E]',
      border: 'border-[#01C38E]/40',
      glow: 'shadow-[#01C38E]/20',
      icon: <span className="text-lg">👑</span>,
    },
    legendary: {
      gradient: 'from-red-400 to-pink-500',
      border: 'border-red-500/40',
      glow: 'shadow-red-500/20',
      icon: <span className="text-lg">&#x1F451;</span>,
    },
  };

  // All categories are displayed in v2
  const displayedCategories: MilestoneCategory[] = ['swap', 'vault', 'payx_sent', 'payx_received'];

  const isMilestoneAchieved = (category: string, tier: string, volume: number) => {
    // First check if recorded in database
    const inDb = data.milestones?.some(m => m.category === category && m.tier === tier) ?? false;
    if (inDb) return true;
    
    // Fallback: check if volume exceeds threshold (milestone earned but not recorded)
    const milestones = MILESTONE_CONFIG[category as MilestoneCategory] || [];
    const milestone = milestones.find(m => m.tier === tier);
    return milestone ? volume >= milestone.threshold : false;
  };

  // Calculate totals only for displayed categories
  const totalMilestonePoints = displayedCategories.reduce((total, catId) => {
    const milestones = MILESTONE_CONFIG[catId] || [];
    const catVolume = catId === 'swap' ? data.volumes.swap : catId === 'vault' ? data.volumes.vault : data.volumes.payx_sent;
    return total + milestones
      .filter(m => isMilestoneAchieved(catId, m.tier, catVolume))
      .reduce((sum, m) => sum + m.points, 0);
  }, 0);

  const totalPossiblePoints = displayedCategories.reduce((total, catId) => {
    return total + (MILESTONE_CONFIG[catId] || []).reduce((sum, m) => sum + m.points, 0);
  }, 0);

  const achievedCount = displayedCategories.reduce((total, catId) => {
    const milestones = MILESTONE_CONFIG[catId] || [];
    const catVolume = catId === 'swap' ? data.volumes.swap : catId === 'vault' ? data.volumes.vault : data.volumes.payx_sent;
    return total + milestones.filter(m => isMilestoneAchieved(catId, m.tier, catVolume)).length;
  }, 0);

  const totalMilestones = displayedCategories.reduce((total, catId) => {
    return total + (MILESTONE_CONFIG[catId] || []).length;
  }, 0);

  const progressPercent = totalMilestones > 0 ? (achievedCount / totalMilestones) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Hero Summary Card */}
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-yellow-600 via-orange-600 to-amber-600 rounded-2xl blur-xl opacity-20 group-hover:opacity-30 transition duration-500" />
        
        <div className="relative bg-[#12131a]/80 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden">
          {/* Pattern overlay */}
          <div className="absolute inset-0 opacity-5"
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
              backgroundSize: '24px 24px'
            }}
          />
          
          <div className="relative p-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              {/* Left: Points */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
                  <span className="text-gray-400 text-xs font-medium uppercase tracking-wider">Milestone Points</span>
                </div>
                
                <div className="flex items-baseline gap-3">
                  <span className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-yellow-200 via-amber-300 to-yellow-200 bg-clip-text text-transparent">
                    {totalMilestonePoints.toLocaleString()}
                  </span>
                  <span className="text-gray-500 text-xl">/ {totalPossiblePoints.toLocaleString()}</span>
                </div>
              </div>

              {/* Right: Count */}
              <div className="flex items-center gap-4 bg-yellow-500/10 rounded-xl p-4 border border-yellow-500/20">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-yellow-500 to-amber-600 flex items-center justify-center shadow-lg shadow-yellow-500/25">
                  <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                </div>
                <div>
                  <p className="text-3xl font-bold text-white">{achievedCount}</p>
                  <p className="text-sm text-gray-400">Milestones Achieved</p>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-6">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-400">Overall Progress</span>
                <span className="text-yellow-400 font-medium">{progressPercent.toFixed(0)}%</span>
              </div>
              <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-yellow-500 via-amber-500 to-orange-500 transition-all duration-1000 rounded-full"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="space-y-6">
        {categories.map((category, catIndex) => {
          const milestones = MILESTONE_CONFIG[category.id] || [];
          const catAchievedCount = milestones.filter(m => isMilestoneAchieved(category.id, m.tier, category.volume)).length;

          return (
            <div
              key={category.id}
              className={`relative bg-gradient-to-br ${category.bgGradient} backdrop-blur-xl rounded-xl border ${category.borderColor} overflow-hidden`}
              style={{ animationDelay: `${catIndex * 100}ms` }}
            >
              {/* Header */}
              <div className="p-5 border-b border-white/5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${category.gradient} flex items-center justify-center text-white shadow-lg`}>
                      {category.icon}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">{category.name} Milestones</h3>
                      <p className="text-sm text-gray-400">
                        Volume: ${category.volume >= 1000 
                          ? `${(category.volume / 1000).toFixed(1)}K`
                          : category.volume.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-white">{catAchievedCount}/{milestones.length}</p>
                    <p className="text-xs text-gray-500">achieved</p>
                  </div>
                </div>
              </div>

              {/* Milestones Grid */}
              <div className="p-5">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                  {milestones.map((milestone) => {
                    const achieved = isMilestoneAchieved(category.id, milestone.tier, category.volume);
                    const progress = Math.min((category.volume / milestone.threshold) * 100, 100);
                    const style = tierStyles[milestone.tier] || tierStyles.bronze;

                    return (
                      <div
                        key={milestone.tier}
                        className={`group relative rounded-xl p-4 border transition-all duration-300 ${
                          achieved 
                            ? `bg-gradient-to-br ${style.gradient}/10 ${style.border} shadow-lg ${style.glow} hover:-translate-y-1`
                            : 'bg-black/20 border-white/5 opacity-60 hover:opacity-80'
                        }`}
                      >
                        {/* Achieved checkmark */}
                        {achieved && (
                          <div className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-[#01C38E] flex items-center justify-center shadow-lg">
                            <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        )}
                        
                        {/* Tier icon & name */}
                        <div className="flex items-center gap-2 mb-3">
                          {style.icon}
                          <span className={`font-semibold capitalize ${achieved ? 'text-white' : 'text-gray-400'}`}>
                            {milestone.tier}
                          </span>
                        </div>
                        
                        {/* Threshold */}
                        <p className="text-xs text-gray-500 mb-1">
                          ${milestone.threshold >= 1000 
                            ? `${(milestone.threshold / 1000).toFixed(0)}K`
                            : milestone.threshold.toLocaleString()}
                        </p>
                        
                        {/* Points */}
                        <p className={`text-xl font-bold ${achieved ? 'text-white' : 'text-gray-500'}`}>
                          {milestone.points} <span className="text-sm font-normal">pts</span>
                        </p>

                        {/* Progress bar for unachieved */}
                        {!achieved && (
                          <div className="mt-3">
                            <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
                              <div
                                className={`h-full bg-gradient-to-r ${style.gradient} transition-all duration-500`}
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                            <p className="text-xs text-gray-500 mt-1.5 text-center">
                              {progress.toFixed(0)}%
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Info Card */}
      <div className="relative overflow-hidden bg-gradient-to-r from-yellow-500/5 via-orange-500/5 to-amber-500/5 rounded-xl p-5 border border-white/5">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-yellow-500/20 to-orange-500/20 flex items-center justify-center flex-shrink-0 border border-yellow-500/20">
            <svg className="w-5 h-5 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-white font-medium mb-1">About Milestones</p>
            <p className="text-gray-400 text-sm leading-relaxed">
              Milestones are one-time achievements based on your cumulative volume. 
              Each milestone can only be earned once and contributes to your total points permanently.
            </p>
          </div>
        </div>
        
        <div className="absolute -right-20 -bottom-20 w-40 h-40 bg-yellow-500/10 rounded-full blur-3xl" />
      </div>
    </div>
  );
}
