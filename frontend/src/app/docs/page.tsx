import Link from 'next/link';

export default function DocsPage() {
  return (
    <div>
      {/* Hero */}
      <div className="mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#01C38E]/10 border border-[#01C38E]/20 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-[#01C38E] rounded-full animate-pulse" />
          <span className="text-xs text-[#01C38E] font-medium">Live on Arc Testnet</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
          XyloNet Documentation
        </h1>
        <p className="text-xl text-gray-400 leading-relaxed">
          Welcome to XyloNet — the Stablecoin SuperExchange built on Arc Network. 
          Swap, bridge, provide liquidity, and earn yield with USDC and EURC.
        </p>
      </div>

      {/* What is XyloNet */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">What is XyloNet?</h2>
        <p className="text-gray-400 mb-6 leading-relaxed">
          XyloNet is a comprehensive DeFi protocol designed specifically for stablecoins on Arc Network — 
          Circle&apos;s Layer 1 blockchain. It combines a StableSwap AMM for low-slippage trading, 
          a native CCTP bridge for cross-chain transfers, liquidity pools for earning fees, 
          and yield vaults for passive income.
        </p>
        
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="p-5 bg-white/[0.02] border border-white/5 rounded-xl">
            <div className="flex items-center gap-3 mb-3">
              <img src="/tokens/usdc.svg" alt="USDC" className="w-8 h-8" />
              <span className="text-white font-semibold">USDC-Native</span>
            </div>
            <p className="text-sm text-gray-400">
              Built on Arc Network where USDC is the native gas token. No ETH needed.
            </p>
          </div>
          <div className="p-5 bg-white/[0.02] border border-white/5 rounded-xl">
            <div className="flex items-center gap-3 mb-3">
              <img src="/chains/arc.png" alt="Arc" className="w-8 h-8" />
              <span className="text-white font-semibold">Sub-Second Finality</span>
            </div>
            <p className="text-sm text-gray-400">
              Arc Network delivers &lt;350ms transaction finality for instant settlement.
            </p>
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">Key Features</h2>
        <div className="space-y-4">
          <Link href="/docs/swap" className="block p-5 bg-gradient-to-r from-[#01C38E]/5 to-transparent border border-white/5 hover:border-[#01C38E]/30 rounded-xl transition-all group">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-[#01C38E]/20 rounded-lg flex items-center justify-center text-xl shrink-0">
                🔄
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white group-hover:text-[#01C38E] transition-colors">
                  StableSwap AMM
                </h3>
                <p className="text-sm text-gray-400 mt-1">
                  Trade stablecoins with near-zero slippage using Curve&apos;s battle-tested invariant algorithm. 
                  Only 0.04% swap fee.
                </p>
              </div>
            </div>
          </Link>

          <Link href="/docs/bridge" className="block p-5 bg-gradient-to-r from-[#0A786A]/5 to-transparent border border-white/5 hover:border-[#0A786A]/30 rounded-xl transition-all group">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-[#0A786A]/20 rounded-lg flex items-center justify-center text-xl shrink-0">
                🌉
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white group-hover:text-[#0A786A] transition-colors">
                  CCTP V2 Bridge
                </h3>
                <p className="text-sm text-gray-400 mt-1">
                  Native USDC transfers across 7+ chains via Circle&apos;s Cross-Chain Transfer Protocol. 
                  No wrapped tokens, always real USDC.
                </p>
              </div>
            </div>
          </Link>

          <Link href="/docs/pools" className="block p-5 bg-gradient-to-r from-[#01C38E]/5 to-transparent border border-white/5 hover:border-[#01C38E]/30 rounded-xl transition-all group">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-[#01C38E]/20 rounded-lg flex items-center justify-center text-xl shrink-0">
                💧
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white group-hover:text-[#01C38E] transition-colors">
                  Liquidity Pools
                </h3>
                <p className="text-sm text-gray-400 mt-1">
                  Provide liquidity and earn 0.04% on every swap. LP tokens are ERC-20 compatible 
                  and can be used across DeFi.
                </p>
              </div>
            </div>
          </Link>

          <Link href="/docs/vault" className="block p-5 bg-gradient-to-r from-[#132D46]/5 to-transparent border border-white/5 hover:border-[#132D46]/30 rounded-xl transition-all group">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-[#132D46]/20 rounded-lg flex items-center justify-center text-xl shrink-0">
                🏦
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white group-hover:text-[#01C38E] transition-colors">
                  Yield Vaults
                </h3>
                <p className="text-sm text-gray-400 mt-1">
                  ERC-4626 compliant vaults with auto-compounding strategies. 
                  Earn passive income on your stablecoins.
                </p>
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* Supported Assets */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">Supported Assets</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="p-5 bg-white/[0.02] border border-white/5 rounded-xl">
            <img src="/tokens/usdc.svg" alt="USDC" className="w-12 h-12 mb-3" />
            <h4 className="text-white font-semibold">USDC</h4>
            <p className="text-sm text-gray-500 mt-1">USD Coin by Circle</p>
            <p className="text-xs text-gray-600 mt-2">Native gas token on Arc</p>
          </div>
          <div className="p-5 bg-white/[0.02] border border-white/5 rounded-xl">
            <img src="/tokens/eurc.png" alt="EURC" className="w-12 h-12 mb-3" />
            <h4 className="text-white font-semibold">EURC</h4>
            <p className="text-sm text-gray-500 mt-1">Euro Coin by Circle</p>
            <p className="text-xs text-gray-600 mt-2">EUR-backed stablecoin</p>
          </div>
          <div className="p-5 bg-white/[0.02] border border-white/5 rounded-xl">
            <img src="/tokens/usyc.png" alt="USYC" className="w-12 h-12 mb-3" />
            <h4 className="text-white font-semibold">USYC</h4>
            <p className="text-sm text-gray-500 mt-1">US Yield Coin</p>
            <p className="text-xs text-gray-600 mt-2">Yield-bearing stablecoin</p>
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">Protocol Stats</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 bg-gradient-to-br from-[#01C38E]/10 to-[#01C38E]/5 border border-[#01C38E]/20 rounded-xl">
            <div className="text-2xl font-bold text-white">&lt;350ms</div>
            <div className="text-sm text-gray-400">Finality</div>
          </div>
          <div className="p-4 bg-gradient-to-br from-[#0A786A]/10 to-[#0A786A]/5 border border-[#0A786A]/20 rounded-xl">
            <div className="text-2xl font-bold text-white">0.04%</div>
            <div className="text-sm text-gray-400">Swap Fee</div>
          </div>
          <div className="p-4 bg-gradient-to-br from-[#132D46]/10 to-[#132D46]/5 border border-[#132D46]/20 rounded-xl">
            <div className="text-2xl font-bold text-white">~$0.01</div>
            <div className="text-sm text-gray-400">Per TX</div>
          </div>
          <div className="p-4 bg-gradient-to-br from-[#01C38E]/10 to-[#0A786A]/5 border border-[#01C38E]/20 rounded-xl">
            <div className="text-2xl font-bold text-white">7+</div>
            <div className="text-sm text-gray-400">Chains</div>
          </div>
        </div>
      </section>

      {/* Next Steps */}
      <section>
        <h2 className="text-2xl font-bold text-white mb-4">Get Started</h2>
        <div className="p-6 bg-gradient-to-r from-[#01C38E]/10 to-[#0A786A]/10 border border-[#01C38E]/20 rounded-xl">
          <p className="text-gray-300 mb-4">
            Ready to start using XyloNet? Follow our quick start guide to connect your wallet 
            and make your first trade in under 5 minutes.
          </p>
          <Link
            href="/docs/quickstart"
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white font-medium transition-colors"
          >
            Quick Start Guide
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </section>
    </div>
  );
}
