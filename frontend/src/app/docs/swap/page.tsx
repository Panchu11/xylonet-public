'use client'

export default function SwapPage() {
  return (
    <div className="prose prose-invert max-w-none">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-white mb-4">Swap</h1>
        <p className="text-xl text-gray-400">
          Swap stablecoins with minimal slippage using XyloNet's StableSwap AMM, optimized for pegged assets.
        </p>
      </div>

      {/* Supported Pairs */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">Supported Trading Pairs</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-[#0A786A]/10 to-[#01C38E]/10 border border-[#0A786A]/20 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex -space-x-2">
                <img src="/tokens/usdc.svg" alt="USDC" className="w-10 h-10 rounded-full ring-2 ring-[#0f172a]" />
                <img src="/tokens/eurc.png" alt="EURC" className="w-10 h-10 rounded-full ring-2 ring-[#0f172a]" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">USDC / EURC</h3>
                <p className="text-sm text-gray-400">USD ↔ EUR Forex</p>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Pool Address:</span>
                <a href="https://testnet.arcscan.app/address/0x3DF3966F5138143dce7a9cFDdC2c0310ce083BB1" target="_blank" rel="noopener" className="text-[#01C38E] font-mono text-xs hover:text-[#0A786A]">
                  0x3DF3...BB1
                </a>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Swap Fee:</span>
                <span className="text-white">0.04%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Amplification:</span>
                <span className="text-white">100</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500/10 to-cyan-500/10 border border-green-500/20 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex -space-x-2">
                <img src="/tokens/usdc.svg" alt="USDC" className="w-10 h-10 rounded-full ring-2 ring-[#0f172a]" />
                <img src="/tokens/usyc.png" alt="USYC" className="w-10 h-10 rounded-full ring-2 ring-[#0f172a]" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">USDC / USYC</h3>
                <p className="text-sm text-gray-400">Yield Swap</p>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Pool Address:</span>
                <a href="https://testnet.arcscan.app/address/0x8296cC7477A9CD12cF632042fDDc2aB89151bb61" target="_blank" rel="noopener" className="text-blue-400 font-mono text-xs hover:text-blue-300">
                  0x8296...b61
                </a>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Swap Fee:</span>
                <span className="text-white">0.04%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Amplification:</span>
                <span className="text-white">100</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How to Swap */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">How to Swap</h2>
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <ol className="space-y-6">
            <li className="flex gap-4">
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold">1</span>
              <div>
                <h4 className="text-white font-semibold mb-1">Connect Your Wallet</h4>
                <p className="text-gray-400 text-sm">Click "Connect Wallet" and select your wallet provider. Make sure you have USDC on Arc Network.</p>
              </div>
            </li>
            <li className="flex gap-4">
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold">2</span>
              <div>
                <h4 className="text-white font-semibold mb-1">Select Tokens</h4>
                <p className="text-gray-400 text-sm">Choose the token you want to swap from (e.g., USDC) and the token you want to receive (e.g., EURC).</p>
              </div>
            </li>
            <li className="flex gap-4">
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold">3</span>
              <div>
                <h4 className="text-white font-semibold mb-1">Enter Amount</h4>
                <p className="text-gray-400 text-sm">Enter the amount you want to swap. The output amount and price impact will be calculated automatically.</p>
              </div>
            </li>
            <li className="flex gap-4">
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold">4</span>
              <div>
                <h4 className="text-white font-semibold mb-1">Review & Confirm</h4>
                <p className="text-gray-400 text-sm">Check the exchange rate, minimum received, and price impact. Click "Swap" and confirm the transaction in your wallet.</p>
              </div>
            </li>
            <li className="flex gap-4">
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 font-bold">✓</span>
              <div>
                <h4 className="text-white font-semibold mb-1">Receive Tokens</h4>
                <p className="text-gray-400 text-sm">Your swapped tokens will appear in your wallet within seconds. View the transaction on Arcscan.</p>
              </div>
            </li>
          </ol>
        </div>
      </section>

      {/* StableSwap AMM */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">StableSwap AMM</h2>
        <div className="space-y-6">
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">What is StableSwap?</h3>
            <p className="text-gray-300 mb-4">
              XyloNet uses a StableSwap invariant (based on Curve's algorithm) specifically designed for trading 
              assets that are pegged to similar values, like stablecoins. Unlike constant product AMMs (x*y=k),
              StableSwap provides significantly lower slippage for stable pairs.
            </p>
            <div className="bg-[#0a0a0f] rounded-lg p-4 font-mono text-sm">
              <p className="text-gray-400">// StableSwap Invariant</p>
              <p className="text-blue-400">An * sum(x_i) + D = An * D + D^(n+1) / (n^n * prod(x_i))</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h4 className="text-white font-semibold mb-3">Amplification Factor (A)</h4>
              <p className="text-gray-400 text-sm mb-3">
                The amplification factor determines how "stable" the swap curve is. Higher A values mean the 
                curve behaves more like a constant sum (x+y=k), providing lower slippage near the peg.
              </p>
              <div className="flex items-center gap-2">
                <span className="text-gray-400">Current A:</span>
                <span className="text-white font-mono bg-blue-500/20 px-2 py-1 rounded">100</span>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h4 className="text-white font-semibold mb-3">Fee Structure</h4>
              <p className="text-gray-400 text-sm mb-3">
                A small fee is charged on each swap, which goes to liquidity providers as an incentive for 
                providing liquidity.
              </p>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Swap Fee:</span>
                  <span className="text-white font-mono">0.04%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Protocol Fee:</span>
                  <span className="text-white font-mono">0%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Slippage Settings */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">Slippage Settings</h2>
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <p className="text-gray-300 mb-4">
            Slippage tolerance determines the maximum price difference you're willing to accept between 
            the quoted price and the execution price. If the price moves beyond your tolerance, the 
            transaction will revert.
          </p>
          <div className="grid grid-cols-4 gap-3 mb-4">
            <button className="py-2 px-4 bg-white/10 rounded-lg text-white text-sm hover:bg-white/20 transition-colors">
              0.1%
            </button>
            <button className="py-2 px-4 bg-blue-500/30 rounded-lg text-blue-400 text-sm border border-blue-500/50">
              0.5%
            </button>
            <button className="py-2 px-4 bg-white/10 rounded-lg text-white text-sm hover:bg-white/20 transition-colors">
              1.0%
            </button>
            <button className="py-2 px-4 bg-white/10 rounded-lg text-white text-sm hover:bg-white/20 transition-colors">
              Custom
            </button>
          </div>
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
            <p className="text-yellow-200 text-sm flex items-start gap-2">
              <span className="text-yellow-400">💡</span>
              <span>For stablecoin swaps, 0.1% - 0.5% slippage is usually sufficient due to the stable nature of the assets.</span>
            </p>
          </div>
        </div>
      </section>

      {/* Price Impact */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">Understanding Price Impact</h2>
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <p className="text-gray-300 mb-6">
            Price impact is the difference between the market price and the price you receive based on your 
            trade size. Larger trades have higher price impact.
          </p>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-400 mb-1">{"< 0.1%"}</div>
              <p className="text-green-200 text-sm">Excellent</p>
              <p className="text-gray-400 text-xs mt-2">Perfect for small to medium trades</p>
            </div>
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
              <div className="text-2xl font-bold text-yellow-400 mb-1">0.1% - 1%</div>
              <p className="text-yellow-200 text-sm">Moderate</p>
              <p className="text-gray-400 text-xs mt-2">Acceptable for larger trades</p>
            </div>
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
              <div className="text-2xl font-bold text-red-400 mb-1">{"> 1%"}</div>
              <p className="text-red-200 text-sm">High</p>
              <p className="text-gray-400 text-xs mt-2">Consider splitting your trade</p>
            </div>
          </div>
        </div>
      </section>

      {/* Router Contract */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">Smart Contract</h2>
        <div className="bg-[#0a0a0f] border border-white/10 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-white/10 bg-white/5">
            <h3 className="font-mono text-sm text-gray-400">XyloRouter</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Contract Address</p>
                <a 
                  href="https://testnet.arcscan.app/address/0x73742278c31a76dBb0D2587d03ef92E6E2141023" 
                  target="_blank" 
                  rel="noopener"
                  className="text-blue-400 font-mono text-sm hover:text-blue-300 break-all"
                >
                  0x73742278c31a76dBb0D2587d03ef92E6E2141023
                </a>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Key Functions</p>
                <div className="space-y-2 font-mono text-sm">
                  <div className="bg-white/5 rounded p-2">
                    <span className="text-[#0A786A]">swap</span>
                    <span className="text-gray-400">(pool, tokenIn, tokenOut, amountIn, minAmountOut)</span>
                  </div>
                  <div className="bg-white/5 rounded p-2">
                    <span className="text-[#0A786A]">getAmountOut</span>
                    <span className="text-gray-400">(pool, tokenIn, tokenOut, amountIn)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section>
        <div className="bg-gradient-to-r from-[#0A786A]/20 to-[#01C38E]/20 border border-[#0A786A]/30 rounded-xl p-8 text-center">
          <h3 className="text-2xl font-bold text-white mb-4">Ready to Swap?</h3>
          <p className="text-gray-300 mb-6">Start swapping stablecoins with minimal slippage.</p>
          <a 
            href="/swap" 
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#0A786A] to-[#01C38E] text-white font-semibold rounded-xl hover:opacity-90 transition-opacity"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
            Launch Swap
          </a>
        </div>
      </section>
    </div>
  )
}
