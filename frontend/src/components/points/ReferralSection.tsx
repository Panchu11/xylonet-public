'use client';

import { useState, useEffect } from 'react';
import { REFERRAL_TIERS, REFERRAL_QUALIFICATION } from '@/lib/points';

interface ReferralSectionProps {
  wallet: string | undefined;
  urlRefCode?: string | null;
}

interface ReferralData {
  has_referral_code: boolean;
  referral_code: string | null;
  is_referred: boolean;
  referred_by: string | null;
  stats: {
    total_referrals: number;
    qualified_referrals: number;
    pending_referrals: number;
    total_points_earned: number;
  } | null;
  referrals: Array<{
    id: string;
    referred_wallet: string;
    status: string;
    qualification_progress: {
      account_age_hours: number;
      total_volume: number;
      products_used: number;
      requirements_met: {
        age: boolean;
        volume: boolean;
        products: boolean;
      };
    };
    referred_at: string;
    qualified_at: string | null;
    points_awarded: number;
  }>;
  tier_info: {
    currentTier: number;
    pointsPerReferral: number;
    nextTierAt: number | null;
    nextTierPoints: number | null;
    referralsInCurrentTier: number;
  } | null;
}

export default function ReferralSection({ wallet, urlRefCode }: ReferralSectionProps) {
  const [data, setData] = useState<ReferralData | null>(null);
  const [loading, setLoading] = useState(true);
  const [inputCode, setInputCode] = useState('');
  const [applying, setApplying] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [copied, setCopied] = useState<'code' | 'link' | null>(null);
  const [autoApplied, setAutoApplied] = useState(false);

  useEffect(() => {
    async function fetchReferralData() {
      if (!wallet) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`/api/referrals?wallet=${wallet}`);
        const json = await res.json();
        
        if (json.success) {
          setData(json.data);
        }
      } catch (error) {
        console.error('Failed to fetch referral data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchReferralData();
  }, [wallet]);

  // Auto-apply referral code from URL
  useEffect(() => {
    async function autoApplyRefCode() {
      // Only apply if: has URL code, wallet connected, data loaded, not already referred, not already tried
      if (!urlRefCode || !wallet || !data || data.is_referred || autoApplied) {
        return;
      }

      setAutoApplied(true); // Prevent multiple attempts
      setApplying(true);

      try {
        const res = await fetch('/api/referrals', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            wallet,
            referral_code: urlRefCode.trim().toUpperCase(),
          }),
        });

        const json = await res.json();

        if (json.success) {
          setMessage({ type: 'success', text: `Referral code ${urlRefCode.toUpperCase()} applied successfully!` });
          // Refresh data
          const refreshRes = await fetch(`/api/referrals?wallet=${wallet}`);
          const refreshJson = await refreshRes.json();
          if (refreshJson.success) {
            setData(refreshJson.data);
          }
        } else {
          setMessage({ type: 'error', text: json.error || 'Failed to apply referral code' });
        }
      } catch {
        setMessage({ type: 'error', text: 'Failed to apply referral code' });
      } finally {
        setApplying(false);
      }
    }

    autoApplyRefCode();
  }, [urlRefCode, wallet, data, autoApplied]);

  const copyReferralCode = async () => {
    if (data?.referral_code) {
      await navigator.clipboard.writeText(data.referral_code);
      setCopied('code');
      setTimeout(() => setCopied(null), 2000);
    }
  };

  const copyReferralLink = async () => {
    if (data?.referral_code) {
      const link = `${window.location.origin}/points?ref=${data.referral_code}`;
      await navigator.clipboard.writeText(link);
      setCopied('link');
      setTimeout(() => setCopied(null), 2000);
    }
  };

  const applyReferralCode = async () => {
    if (!inputCode.trim() || !wallet) return;

    setApplying(true);
    setMessage(null);

    try {
      const res = await fetch('/api/referrals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wallet,
          referral_code: inputCode.trim().toUpperCase(),
        }),
      });

      const json = await res.json();

      if (json.success) {
        setMessage({ type: 'success', text: json.message });
        const refreshRes = await fetch(`/api/referrals?wallet=${wallet}`);
        const refreshJson = await refreshRes.json();
        if (refreshJson.success) {
          setData(refreshJson.data);
        }
        setInputCode('');
      } else {
        setMessage({ type: 'error', text: json.error });
      }
    } catch {
      setMessage({ type: 'error', text: 'Failed to apply referral code' });
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-[#01C38E]/30 rounded-full" />
          <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-t-[#01C38E] rounded-full animate-spin" />
        </div>
        <p className="text-gray-400 animate-pulse">Loading referrals...</p>
      </div>
    );
  }

  if (!wallet || !data) {
    return (
      <div className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-[#0A786A]/50 to-[#01C38E]/50 rounded-2xl blur opacity-20" />
        <div className="relative bg-[#12131a]/80 backdrop-blur-xl rounded-2xl p-12 border border-white/10 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#01C38E]/20 flex items-center justify-center">
            <svg className="w-8 h-8 text-[#01C38E]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <p className="text-gray-400">Connect your wallet to view referral information</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Hero: Your Referral Code */}
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-[#132D46] via-[#0A786A] to-[#01C38E] rounded-2xl blur-xl opacity-20 group-hover:opacity-30 transition duration-500" />
        
        <div className="relative bg-[#12131a]/80 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden">
          <div className="absolute inset-0 opacity-5"
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
              backgroundSize: '24px 24px'
            }}
          />
          
          <div className="relative p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0A786A] to-[#01C38E] flex items-center justify-center shadow-lg shadow-[#01C38E]/25">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white">Your Referral Code</h3>
                <p className="text-sm text-gray-500">Share with friends to earn points</p>
              </div>
            </div>
            
            {data.referral_code ? (
              <div className="space-y-5">
                {/* Code Display */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <div className="flex-1 bg-black/30 rounded-xl px-6 py-4 border border-white/10">
                    <p className="text-3xl font-mono font-bold text-white tracking-[0.2em] text-center sm:text-left">
                      {data.referral_code}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={copyReferralCode}
                      className={`flex-1 sm:flex-none px-5 py-4 rounded-xl font-medium transition-all duration-300 ${
                        copied === 'code'
                          ? 'bg-[#01C38E] text-white'
                          : 'bg-[#01C38E] hover:bg-[#0A786A] text-white'
                      }`}
                    >
                      {copied === 'code' ? (
                        <span className="flex items-center gap-2 justify-center">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Copied!
                        </span>
                      ) : 'Copy Code'}
                    </button>
                    <button
                      onClick={copyReferralLink}
                      className={`flex-1 sm:flex-none px-5 py-4 rounded-xl font-medium transition-all duration-300 ${
                        copied === 'link'
                          ? 'bg-[#01C38E] text-white'
                          : 'bg-white/10 hover:bg-white/20 text-white border border-white/10'
                      }`}
                    >
                      {copied === 'link' ? 'Copied!' : 'Copy Link'}
                    </button>
                  </div>
                </div>
                
                {/* Tier Info */}
                {data.tier_info && (
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                    <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                      <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Current Tier</p>
                      <p className="text-xl font-bold text-white">Tier {data.tier_info.currentTier}</p>
                    </div>
                    <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                      <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Points/Referral</p>
                      <p className="text-xl font-bold text-[#01C38E]">{data.tier_info.pointsPerReferral} pts</p>
                    </div>
                    {data.tier_info.nextTierAt && (
                      <div className="col-span-2 lg:col-span-1 bg-white/5 rounded-xl p-4 border border-white/5">
                        <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Next Tier</p>
                        <p className="text-lg font-bold text-white">
                          {data.tier_info.nextTierAt} referrals
                          <span className="text-gray-500 font-normal text-sm ml-2">({data.tier_info.nextTierPoints} pts each)</span>
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-400">Your referral code will be generated automatically.</p>
            )}
          </div>
        </div>
      </div>

      {/* Referred Status or Apply Code */}
      {data.is_referred ? (
        <div className="bg-[#0A786A]/10 border border-[#0A786A]/30 rounded-xl p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-[#0A786A]/20 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-[#01C38E]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <p className="text-[#01C38E] font-medium">You were referred!</p>
            <p className="text-gray-400 text-sm">Code: <span className="font-mono font-bold text-[#01C38E]">{data.referred_by}</span></p>
          </div>
        </div>
      ) : (
        <div className="relative bg-[#12131a]/60 backdrop-blur-xl rounded-xl border border-white/10 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Have a Referral Code?</h3>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value.toUpperCase())}
              placeholder="Enter code (e.g., REFXXXXXXX)"
              className="flex-1 px-5 py-3.5 bg-black/30 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#01C38E]/50 focus:ring-2 focus:ring-[#01C38E]/20 transition-all font-mono tracking-wider"
              maxLength={11}
            />
            <button
              onClick={applyReferralCode}
              disabled={applying || !inputCode.trim()}
              className="px-8 py-3.5 bg-gradient-to-r from-[#0A786A] to-[#01C38E] hover:from-[#132D46] hover:to-[#0A786A] disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed text-white rounded-xl transition-all font-medium shadow-lg shadow-[#01C38E]/25 disabled:shadow-none"
            >
              {applying ? 'Applying...' : 'Apply'}
            </button>
          </div>

          {message && (
            <div className={`mt-4 p-4 rounded-xl flex items-center gap-3 ${
              message.type === 'success' 
                ? 'bg-[#0A786A]/10 border border-[#0A786A]/30' 
                : 'bg-red-500/10 border border-red-500/30'
            }`}>
              {message.type === 'success' ? (
                <svg className="w-5 h-5 text-[#01C38E] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-red-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
              <span className={message.type === 'success' ? 'text-[#01C38E]' : 'text-red-400'}>
                {message.text}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Stats Grid */}
      {data.stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Referrals', value: data.stats.total_referrals, color: 'text-white', bg: 'from-gray-500/10 to-slate-500/10', border: 'border-gray-500/20' },
            { label: 'Qualified', value: data.stats.qualified_referrals, color: 'text-[#01C38E]', bg: 'from-[#0A786A]/10 to-[#01C38E]/10', border: 'border-[#0A786A]/20' },
            { label: 'Pending', value: data.stats.pending_referrals, color: 'text-yellow-400', bg: 'from-yellow-500/10 to-amber-500/10', border: 'border-yellow-500/20' },
            { label: 'Points Earned', value: data.stats.total_points_earned, color: 'text-[#01C38E]', bg: 'from-[#01C38E]/10 to-[#0A786A]/10', border: 'border-[#01C38E]/20' },
          ].map((stat) => (
            <div key={stat.label} className={`bg-gradient-to-br ${stat.bg} rounded-xl p-5 border ${stat.border}`}>
              <p className="text-gray-400 text-xs uppercase tracking-wider mb-2">{stat.label}</p>
              <p className={`text-3xl font-bold ${stat.color}`}>{stat.value.toLocaleString()}</p>
            </div>
          ))}
        </div>
      )}

      {/* Referral Tiers */}
      <div className="relative bg-[#12131a]/60 backdrop-blur-xl rounded-xl border border-white/10 overflow-hidden">
        <div className="p-6 border-b border-white/5">
          <h3 className="text-lg font-semibold text-white">Referral Tiers</h3>
          <p className="text-sm text-gray-500 mt-1">Earn points for each successful referral</p>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {REFERRAL_TIERS.map((tier, index) => {
              const isActive = data.tier_info?.currentTier === index + 1;
              return (
                <div
                  key={index}
                  className={`relative rounded-xl p-4 border transition-all ${
                    isActive
                      ? 'bg-gradient-to-br from-[#0A786A]/20 to-[#01C38E]/20 border-[#01C38E]/40 shadow-lg shadow-[#01C38E]/10'
                      : 'bg-white/5 border-white/10 hover:border-white/20'
                  }`}
                >
                  {isActive && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-[#01C38E] flex items-center justify-center shadow-lg">
                      <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                  <p className="text-gray-400 text-sm mb-2">
                    {tier.maxReferral === Infinity ? `${tier.minReferral}+` : `${tier.minReferral}-${tier.maxReferral}`} referrals
                  </p>
                  <p className="text-2xl font-bold text-white">{tier.pointsEach}</p>
                  <p className="text-gray-500 text-xs mt-1">pts each</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Qualification Requirements */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#0A786A]/5 via-[#01C38E]/5 to-[#132D46]/5 rounded-xl p-6 border border-white/5">
        <h4 className="text-white font-medium mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-[#01C38E]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          Qualification Requirements
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[
            { label: 'Account Age', value: `${REFERRAL_QUALIFICATION.minAccountAgeHours}+ hours`, icon: '&#x23F1;' },
            { label: 'Total Volume', value: `$${REFERRAL_QUALIFICATION.minTotalVolume}+`, icon: '&#x1F4B0;' },
            { label: 'Products Used', value: `${REFERRAL_QUALIFICATION.minProductsUsed}+`, icon: '&#x1F4E6;' },
          ].map((req) => (
            <div key={req.label} className="flex items-center gap-3">
              <span className="text-xl">{req.icon}</span>
              <div>
                <p className="text-gray-500 text-xs">{req.label}</p>
                <p className="text-white font-medium">{req.value}</p>
              </div>
            </div>
          ))}
        </div>
        
        <div className="absolute -right-20 -bottom-20 w-40 h-40 bg-[#01C38E]/10 rounded-full blur-3xl" />
      </div>

      {/* Referral List */}
      {data.referrals.length > 0 && (
        <div className="relative bg-[#12131a]/60 backdrop-blur-xl rounded-xl border border-white/10 overflow-hidden">
          <div className="p-5 border-b border-white/5 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Your Referrals</h3>
            <span className="text-sm text-gray-500">{data.referrals.length} total</span>
          </div>
          <div className="divide-y divide-white/5">
            {data.referrals.map((referral) => (
              <div key={referral.id} className="p-5 flex items-center justify-between hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0A786A]/20 to-[#01C38E]/20 flex items-center justify-center border border-[#01C38E]/20">
                    <svg className="w-5 h-5 text-[#01C38E]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-white font-medium font-mono">{referral.referred_wallet}</p>
                    <p className="text-gray-500 text-sm">
                      {new Date(referral.referred_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="text-right flex flex-col items-end gap-1">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    referral.status === 'qualified' 
                      ? 'bg-[#0A786A]/20 text-[#01C38E] border border-[#0A786A]/30' 
                      : referral.status === 'pending'
                      ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                      : 'bg-red-500/20 text-red-400 border border-red-500/30'
                  }`}>
                    {referral.status}
                  </span>
                  {referral.points_awarded > 0 && (
                    <p className="text-[#01C38E] text-sm font-medium">+{referral.points_awarded} pts</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
