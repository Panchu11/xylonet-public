'use client';

interface OnChainProgressProps {
  data: {
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
    first_interactions: Array<{
      interaction_type: string;
      points_awarded: number;
      completed_at: string;
    }>;
    activity: {
      products_used: number;
      active_days: number;
    };
  } | null;
}

export default function OnChainProgress({ data }: OnChainProgressProps) {
  if (!data) {
    return null;
  }

  const products = [
    {
      id: 'swap',
      name: 'Swap',
      volume: data.volumes.swap,
      count: data.counts?.swap || 0,
      firstInteraction: 'first_swap',
      description: 'Trade tokens',
      gradient: 'from-[#0A786A] to-[#01C38E]',
      bgGradient: 'from-[#0A786A]/10 to-[#01C38E]/10',
      borderColor: 'border-[#01C38E]/20',
      shadowColor: 'shadow-[#01C38E]/10',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      ),
    },
    {
      id: 'vault',
      name: 'Vault',
      volume: data.volumes.vault,
      count: data.counts?.vault_deposit || 0,
      firstInteraction: 'first_vault',
      description: 'Earn yield',
      gradient: 'from-[#0A786A] to-[#01C38E]',
      bgGradient: 'from-[#0A786A]/10 to-[#01C38E]/10',
      borderColor: 'border-[#0A786A]/20',
      shadowColor: 'shadow-[#01C38E]/10',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ),
    },
    {
      id: 'payx_sent',
      name: 'PayX Sent',
      volume: data.volumes.payx_sent,
      count: data.counts?.payx_sent || 0,
      firstInteraction: 'first_payx_tip',
      description: 'Send tips',
      gradient: 'from-[#132D46] to-[#0A786A]',
      bgGradient: 'from-[#132D46]/10 to-[#0A786A]/10',
      borderColor: 'border-[#0A786A]/20',
      shadowColor: 'shadow-[#0A786A]/10',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      id: 'payx_received',
      name: 'PayX Received',
      volume: data.volumes.payx_received || 0,
      count: data.counts?.payx_claim || 0,
      firstInteraction: 'first_payx_claim',
      description: 'Receive tips',
      gradient: 'from-[#132D46] to-[#0A786A]',
      bgGradient: 'from-[#132D46]/10 to-[#0A786A]/10',
      borderColor: 'border-[#0A786A]/20',
      shadowColor: 'shadow-[#0A786A]/10',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      ),
    },
  ];

  const hasCompletedFirstInteraction = (type: string) => {
    return data.first_interactions?.some(fi => fi.interaction_type === type) ?? false;
  };

  const totalVolume = data.volumes.swap + data.volumes.vault + data.volumes.payx_sent + (data.volumes.payx_received || 0);
  const productsUsed = data.activity?.products_used || products.filter(p => p.volume > 0).length;
  const activeDays = data.activity?.active_days || 0;

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#01C38E] to-[#0A786A] flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">On-Chain Activity</h3>
            <p className="text-sm text-gray-500">Your activity across XyloNet</p>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-[#01C38E] to-[#0A786A] rounded-xl blur opacity-10 group-hover:opacity-20 transition duration-300" />
        <div className="relative bg-[#12131a]/80 backdrop-blur-xl rounded-xl border border-white/10 overflow-hidden">
          <div className="grid grid-cols-3 divide-x divide-white/5">
            {/* Total Volume */}
            <div className="p-6">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-[#01C38E]" />
                <span className="text-gray-400 text-xs font-medium uppercase tracking-wider">Total Volume</span>
              </div>
              <p className="text-3xl font-bold text-white">
                ${totalVolume >= 1000000 
                  ? `${(totalVolume / 1000000).toFixed(2)}M`
                  : totalVolume >= 1000 
                    ? `${(totalVolume / 1000).toFixed(1)}K`
                    : totalVolume.toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </p>
            </div>
            
            {/* Products Used */}
            <div className="p-6">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-[#01C38E]" />
                <span className="text-gray-400 text-xs font-medium uppercase tracking-wider">Products Used</span>
              </div>
              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-bold text-white">{productsUsed}</p>
                <span className="text-gray-500">/ {products.length}</span>
              </div>
            </div>

            {/* Active Days */}
            <div className="p-6">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-[#01C38E]" />
                <span className="text-gray-400 text-xs font-medium uppercase tracking-wider">Active Days</span>
              </div>
              <p className="text-3xl font-bold text-white">{activeDays}</p>
            </div>
          </div>
          
          {/* Progress bar */}
          <div className="h-1 bg-gray-800">
            <div 
              className="h-full bg-gradient-to-r from-[#01C38E] via-[#0A786A] to-[#132D46] transition-all duration-1000"
              style={{ width: `${(productsUsed / products.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Product Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {products.map((product, index) => {
          const hasFirstBonus = hasCompletedFirstInteraction(product.firstInteraction);
          const isActive = product.volume > 0;

          return (
            <div
              key={product.id}
              className={`group relative bg-gradient-to-br ${product.bgGradient} backdrop-blur-xl rounded-xl border ${product.borderColor} overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${product.shadowColor}`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Decorative corner gradient */}
              <div className={`absolute -top-12 -right-12 w-24 h-24 bg-gradient-to-br ${product.gradient} rounded-full blur-2xl opacity-20`} />
              
              <div className="relative p-5">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${product.gradient} flex items-center justify-center text-white shadow-lg`}>
                      {product.icon}
                    </div>
                    <div>
                      <h4 className="text-base font-semibold text-white">{product.name}</h4>
                      <p className="text-xs text-gray-500">{product.description}</p>
                    </div>
                  </div>
                  
                  {/* Status indicator */}
                  <div className={`w-2.5 h-2.5 rounded-full ${isActive ? 'bg-[#01C38E]' : 'bg-gray-600'}`} />
                </div>

                {/* Volume Display */}
                <div className="bg-black/20 rounded-lg p-4 mb-4">
                  <p className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-1">Volume</p>
                  <p className="text-2xl font-bold text-white font-mono">
                    ${product.volume >= 1000000 
                      ? `${(product.volume / 1000000).toFixed(2)}M`
                      : product.volume >= 1000 
                        ? `${(product.volume / 1000).toFixed(1)}K`
                        : product.volume.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </p>
                </div>

                {/* First Interaction Status */}
                <div className="flex items-center gap-2.5">
                  {hasFirstBonus ? (
                    <>
                      <div className="w-6 h-6 rounded-full bg-[#0A786A]/20 flex items-center justify-center">
                        <svg className="w-3.5 h-3.5 text-[#01C38E]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-[#01C38E] text-sm font-medium">First use bonus earned</span>
                    </>
                  ) : isActive ? (
                    <>
                      <div className="w-6 h-6 rounded-full bg-yellow-500/20 flex items-center justify-center">
                        <svg className="w-3.5 h-3.5 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                        </svg>
                      </div>
                      <span className="text-yellow-400 text-sm font-medium">Bonus available</span>
                    </>
                  ) : (
                    <>
                      <div className="w-6 h-6 rounded-full bg-gray-500/20 flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-gray-500" />
                      </div>
                      <span className="text-gray-500 text-sm">Not started yet</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tip Card */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#01C38E]/5 via-[#0A786A]/5 to-[#132D46]/5 rounded-xl p-5 border border-white/5">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#01C38E]/20 to-[#0A786A]/20 flex items-center justify-center flex-shrink-0 border border-[#01C38E]/20">
            <svg className="w-5 h-5 text-[#01C38E]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <div>
            <p className="text-white font-medium mb-1">Maximize Your Rewards</p>
            <p className="text-gray-400 text-sm leading-relaxed">
              Use multiple products and maintain consistent activity to maximize your points. 
              Regular engagement is valued more than sporadic large transactions.
            </p>
          </div>
        </div>
        
        {/* Decorative gradient */}
        <div className="absolute -right-20 -bottom-20 w-40 h-40 bg-[#01C38E]/10 rounded-full blur-3xl" />
      </div>
    </div>
  );
}
