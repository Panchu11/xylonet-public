'use client'

export default function PoolsPage() {
  return (
    <div className="prose prose-invert max-w-none">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-white mb-4">Liquidity Pools</h1>
        <p className="text-xl text-gray-400">
          Provide liquidity to XyloNet's StableSwap pools and earn trading fees on every swap.
        </p>
      </div>

      {/* Available Pools */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">Available Pools</h2>
        <div className="space-y-6">
          {/* USDC-EURC Pool */}
          <div className="bg-gradient-to-br from-[#0A786A]/10 to-[#01C38E]/10 border border-[#0A786A]/20 rounded-xl p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-4">
                <div className="flex -space-x-3">
                  <img src="/tokens/usdc.svg" alt="USDC" className="w-12 h-12 rounded-full ring-2 ring-[#0f172a]" />
                  <img src="/tokens/eurc.png" alt="EURC" className="w-12 h-12 rounded-full ring-2 ring-[#0f172a]" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">USDC / EURC Pool</h3>
                  <p className="text-sm text-gray-400">USD ↔ EUR Stablecoin Pool</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <p className="text-xs text-gray-500 uppercase">APR</p>
                  <p className="text-lg font-bold text-green-400">~4.5%</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500 uppercase">Swap Fee</p>
                  <p className="text-lg font-bold text-white">0.04%</p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="bg-white/5 rounded-lg p-3">
                <p className="text-gray-400">Pool Address</p>
                <a href="https://testnet.arcscan.app/address/0x3DF3966F5138143dce7a9cFDdC2c0310ce083BB1" target="_blank" rel="noopener" className="text-blue-400 font-mono text-xs hover:text-blue-300">
                  0x3DF3...BB1
                </a>
              </div>
              <div className="bg-white/5 rounded-lg p-3">
                <p className="text-gray-400">Amplification</p>
                <p className="text-white font-mono">100</p>
              </div>
              <div className="bg-white/5 rounded-lg p-3">
                <p className="text-gray-400">Token 0</p>
                <p className="text-white">USDC</p>
              </div>
              <div className="bg-white/5 rounded-lg p-3">
                <p className="text-gray-400">Token 1</p>
                <p className="text-white">EURC</p>
              </div>
            </div>
          </div>

          {/* USDC-USYC Pool */}
          <div className="bg-gradient-to-br from-green-500/10 to-cyan-500/10 border border-green-500/20 rounded-xl p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-4">
                <div className="flex -space-x-3">
                  <img src="/tokens/usdc.svg" alt="USDC" className="w-12 h-12 rounded-full ring-2 ring-[#0f172a]" />
                  <img src="/tokens/usyc.png" alt="USYC" className="w-12 h-12 rounded-full ring-2 ring-[#0f172a]" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">USDC / USYC Pool</h3>
                  <p className="text-sm text-gray-400">Yield-Bearing Stablecoin Pool</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <p className="text-xs text-gray-500 uppercase">APR</p>
                  <p className="text-lg font-bold text-green-400">~5.2%</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500 uppercase">Swap Fee</p>
                  <p className="text-lg font-bold text-white">0.04%</p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="bg-white/5 rounded-lg p-3">
                <p className="text-gray-400">Pool Address</p>
                <a href="https://testnet.arcscan.app/address/0x8296cC7477A9CD12cF632042fDDc2aB89151bb61" target="_blank" rel="noopener" className="text-blue-400 font-mono text-xs hover:text-blue-300">
                  0x8296...b61
                </a>
              </div>
              <div className="bg-white/5 rounded-lg p-3">
                <p className="text-gray-400">Amplification</p>
                <p className="text-white font-mono">100</p>
              </div>
              <div className="bg-white/5 rounded-lg p-3">
                <p className="text-gray-400">Token 0</p>
                <p className="text-white">USDC</p>
              </div>
              <div className="bg-white/5 rounded-lg p-3">
                <p className="text-gray-400">Token 1</p>
                <p className="text-white">USYC</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How LP Works */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">How Liquidity Providing Works</h2>
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <ol className="space-y-6">
            <li className="flex gap-4">
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold">1</span>
              <div>
                <h4 className="text-white font-semibold mb-1">Deposit Tokens</h4>
                <p className="text-gray-400 text-sm">Deposit both tokens of a pool in the correct ratio. For example, deposit USDC and EURC to the USDC/EURC pool.</p>
              </div>
            </li>
            <li className="flex gap-4">
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold">2</span>
              <div>
                <h4 className="text-white font-semibold mb-1">Receive LP Tokens</h4>
                <p className="text-gray-400 text-sm">You receive LP tokens representing your share of the pool. These tokens are ERC-20 compatible and transferable.</p>
              </div>
            </li>
            <li className="flex gap-4">
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 font-bold">3</span>
              <div>
                <h4 className="text-white font-semibold mb-1">Earn Trading Fees</h4>
                <p className="text-gray-400 text-sm">Every swap in the pool pays a 0.04% fee, which is distributed to LP holders proportionally.</p>
              </div>
            </li>
            <li className="flex gap-4">
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-[#0A786A]/20 flex items-center justify-center text-[#01C38E] font-bold">4</span>
              <div>
                <h4 className="text-white font-semibold mb-1">Withdraw Anytime</h4>
                <p className="text-gray-400 text-sm">Burn your LP tokens to withdraw your share of the pool plus accumulated fees.</p>
              </div>
            </li>
          </ol>
        </div>
      </section>

      {/* Adding Liquidity */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">Adding Liquidity</h2>
        <div className="space-y-6">
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">Step-by-Step Guide</h3>
            <ol className="space-y-4 text-gray-300">
              <li className="flex items-start gap-3">
                <span className="text-blue-400 font-bold">1.</span>
                <span>Navigate to the <a href="/pools" className="text-blue-400 hover:text-blue-300">Pools</a> page</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-blue-400 font-bold">2.</span>
                <span>Select the pool you want to provide liquidity to</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-blue-400 font-bold">3.</span>
                <span>Click "Add Liquidity"</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-blue-400 font-bold">4.</span>
                <span>Enter the amount for one token - the other amount will be calculated automatically</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-blue-400 font-bold">5.</span>
                <span>Approve both tokens (first time only)</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-blue-400 font-bold">6.</span>
                <span>Click "Supply" and confirm the transaction</span>
              </li>
            </ol>
          </div>

          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
            <h4 className="text-yellow-200 font-semibold mb-2 flex items-center gap-2">
              <span className="text-yellow-400">⚠️</span>
              Balanced vs Single-Sided Deposits
            </h4>
            <p className="text-yellow-200/80 text-sm">
              XyloNet pools support both balanced deposits (both tokens) and single-sided deposits. However, 
              single-sided deposits may result in slight value loss due to rebalancing. For optimal results, 
              deposit both tokens in a balanced ratio.
            </p>
          </div>
        </div>
      </section>

      {/* Removing Liquidity */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">Removing Liquidity</h2>
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <h3 className="text-lg font-bold text-white mb-4">How to Withdraw</h3>
          <ol className="space-y-4 text-gray-300">
            <li className="flex items-start gap-3">
              <span className="text-blue-400 font-bold">1.</span>
              <span>Go to the Pools page and find your position</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-blue-400 font-bold">2.</span>
              <span>Click "Remove Liquidity"</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-blue-400 font-bold">3.</span>
              <span>Choose how much to withdraw (25%, 50%, 75%, or 100%)</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-blue-400 font-bold">4.</span>
              <span>Select withdrawal type: Balanced (both tokens) or Single (one token)</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-blue-400 font-bold">5.</span>
              <span>Confirm the transaction in your wallet</span>
            </li>
          </ol>
        </div>
      </section>

      {/* LP Token Economics */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">LP Token Economics</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">LP Token Value</h3>
            <p className="text-gray-400 text-sm mb-4">
              Each LP token represents a proportional share of the pool's assets. As fees accumulate, 
              the value of each LP token increases.
            </p>
            <div className="bg-[#0a0a0f] rounded-lg p-4 font-mono text-sm">
              <p className="text-gray-400">// LP Token Value Formula</p>
              <p className="text-blue-400">value = (reserve0 + reserve1) / totalSupply</p>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">Fee Accrual</h3>
            <p className="text-gray-400 text-sm mb-4">
              Trading fees (0.04% per swap) are automatically added to the pool reserves. This means 
              your LP tokens continuously appreciate in value.
            </p>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Swap Fee:</span>
                <span className="text-white">0.04%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">LP Share:</span>
                <span className="text-white">100%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Protocol Fee:</span>
                <span className="text-white">0%</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Impermanent Loss */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">Impermanent Loss</h2>
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <p className="text-gray-300 mb-4">
            Impermanent loss occurs when the price ratio of tokens in the pool changes from when you deposited. 
            However, with <strong className="text-white">stablecoin pools</strong>, impermanent loss is minimal because:
          </p>
          <ul className="space-y-2 text-gray-300 mb-6">
            <li className="flex items-start gap-2">
              <span className="text-green-400">✓</span>
              <span>Stablecoins maintain ~1:1 peg to their reference currency</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-400">✓</span>
              <span>StableSwap curve is optimized for minimal price deviation</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-400">✓</span>
              <span>High amplification factor (A=100) keeps prices stable</span>
            </li>
          </ul>
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
            <p className="text-green-200 text-sm">
              <strong>Good news:</strong> For stablecoin pools like USDC/EURC and USDC/USYC, impermanent loss 
              is typically less than 0.1% even with moderate price fluctuations.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section>
        <div className="bg-gradient-to-r from-green-500/20 to-cyan-500/20 border border-green-500/30 rounded-xl p-8 text-center">
          <h3 className="text-2xl font-bold text-white mb-4">Start Earning</h3>
          <p className="text-gray-300 mb-6">Provide liquidity and earn passive income from trading fees.</p>
          <a 
            href="/pools" 
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-cyan-600 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            View Pools
          </a>
        </div>
      </section>
    </div>
  )
}
