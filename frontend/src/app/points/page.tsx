'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useSearchParams } from 'next/navigation';
import PointsDashboard from '@/components/points/PointsDashboard';
import OnChainProgress from '@/components/points/OnChainProgress';
import MilestoneTracker from '@/components/points/MilestoneTracker';
import ReferralSection from '@/components/points/ReferralSection';
import PointsLeaderboard from '@/components/points/PointsLeaderboard';

interface PointsData {
  total_points: number;
  volume_points: number;
  milestone_points: number;
  first_interaction_points: number;
  consistency_points: number;
  referral_points: number;
  social_points: number;
  diversity_multiplier: number;
  sybil_status: {
    label: string;
    color: string;
    description: string;
    multiplier: number;
  };
  referral_code: string | null;
  successful_referrals: number;
  volumes: {
    swap: number;
    vault: number;
    payx_sent: number;
    payx_received: number;
  };
  counts: {
    swap: number;
    vault_deposit: number;
    payx_sent: number;
    payx_claim: number;
  };
  activity: {
    products_used: number;
    active_days: number;
    first_activity_at: string | null;
    last_activity_at: string | null;
  };
  first_interactions: Array<{
    interaction_type: string;
    points_awarded: number;
    completed_at: string;
  }>;
  milestones: Array<{
    category: string;
    tier: string;
    points_awarded: number;
    achieved_at: string;
  }>;
  referral_stats: {
    total: number;
    qualified: number;
    pending: number;
  };
  exists: boolean;
}

export default function PointsPage() {
  const { address, isConnected } = useAccount();
  const searchParams = useSearchParams();
  const [pointsData, setPointsData] = useState<PointsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'milestones' | 'referrals' | 'leaderboard'>('overview');

  const refCode = searchParams.get('ref');

  useEffect(() => {
    async function fetchPoints() {
      if (!address) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`/api/points?wallet=${address}`);
        const json = await res.json();
        
        if (json.success) {
          setPointsData(json.data);
        }
      } catch (error) {
        console.error('Failed to fetch points:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchPoints();
  }, [address]);

  useEffect(() => {
    if (refCode) {
      setActiveTab('referrals');
    }
  }, [refCode]);

  // Not connected state
  if (!isConnected) {
    return (
      <div className="min-h-screen bg-[#0f172a] relative overflow-hidden">
        {/* Ambient Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 -left-1/4 w-[600px] h-[600px] bg-[#01C38E]/20 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-1/4 -right-1/4 w-[500px] h-[500px] bg-[#0A786A]/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
        </div>
        
        <div className="relative z-10 pt-24 pb-12">
          <div className="container mx-auto px-4">
            <div className="max-w-md mx-auto">
              {/* Glass Card */}
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-[#01C38E] to-[#0A786A] rounded-2xl blur-lg opacity-25 group-hover:opacity-40 transition duration-500" />
                <div className="relative bg-[#12131a]/80 backdrop-blur-xl rounded-2xl p-8 border border-white/10">
                  {/* Icon */}
                  <div className="w-20 h-20 mx-auto mb-6 relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#01C38E] to-[#01C38E] rounded-2xl blur-lg opacity-50" />
                    <div className="relative w-full h-full bg-gradient-to-br from-[#01C38E] to-[#01C38E] rounded-2xl flex items-center justify-center">
                      <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                  </div>
                  
                  <h2 className="text-2xl font-bold text-white text-center mb-3">Connect Wallet</h2>
                  <p className="text-gray-400 text-center mb-6 leading-relaxed">
                    Connect your wallet to view your points, track achievements, and climb the leaderboard.
                  </p>
                  
                  {refCode && (
                    <div className="bg-[#01C38E]/10 border border-[#01C38E]/30 rounded-xl p-4 text-center">
                      <p className="text-[#01C38E] text-sm">
                        Referral code <span className="font-mono font-bold text-[#01C38E]">{refCode}</span> will be applied
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f172a] relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 -left-1/4 w-[600px] h-[600px] bg-[#01C38E]/20 rounded-full blur-[120px]" />
          <div className="absolute bottom-1/4 -right-1/4 w-[500px] h-[500px] bg-[#0A786A]/20 rounded-full blur-[120px]" />
        </div>
        
        <div className="relative z-10 pt-24 pb-12">
          <div className="container mx-auto px-4">
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-[#01C38E]/30 rounded-full" />
                <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-[#01C38E] rounded-full animate-spin" />
              </div>
              <p className="text-gray-400 animate-pulse">Loading your points...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
      </svg>
    )},
    { id: 'milestones', label: 'Milestones', icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
      </svg>
    )},
    { id: 'referrals', label: 'Referrals', icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    )},
    { id: 'leaderboard', label: 'Leaderboard', icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    )},
  ] as const;

  return (
    <div className="min-h-screen bg-[#0a0b0f] relative overflow-hidden">
      {/* Ambient Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[800px] h-[800px] bg-[#01C38E]/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-[#0A786A]/10 rounded-full blur-[150px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-[#0A786A]/5 rounded-full blur-[100px]" />
      </div>

      {/* Subtle Grid */}
      <div className="absolute inset-0 opacity-[0.015] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)`,
          backgroundSize: '64px 64px'
        }}
      />
      
      <div className="relative z-10 pt-24 pb-12">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Header */}
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#01C38E] to-[#01C38E] flex items-center justify-center shadow-lg shadow-[#01C38E]/25">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">Points</h1>
            </div>
            <p className="text-gray-400 text-lg">
              Track your rewards, achievements, and rankings
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="mb-8">
            <div className="inline-flex bg-[#12131a]/80 backdrop-blur-xl rounded-xl p-1.5 border border-white/5 shadow-xl">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-sm transition-all duration-300 ${
                    activeTab === tab.id
                      ? 'text-white'
                      : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
                  {activeTab === tab.id && (
                    <div className="absolute inset-0 bg-gradient-to-r from-[#01C38E]/20 to-[#01C38E]/20 rounded-lg border border-[#01C38E]/30" />
                  )}
                  <span className="relative z-10">{tab.icon}</span>
                  <span className="relative z-10">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="space-y-8">
            {activeTab === 'overview' && (
              <>
                <PointsDashboard data={pointsData} />
                <OnChainProgress data={pointsData} />
              </>
            )}

            {activeTab === 'milestones' && (
              <MilestoneTracker data={pointsData} />
            )}

            {activeTab === 'referrals' && (
              <ReferralSection wallet={address} urlRefCode={refCode} />
            )}

            {activeTab === 'leaderboard' && (
              <PointsLeaderboard wallet={address} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
