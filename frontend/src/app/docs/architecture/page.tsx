'use client'

export default function ArchitecturePage() {
  return (
    <div className="prose prose-invert max-w-none">
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-white mb-4">Architecture</h1>
        <p className="text-xl text-gray-400">
          A deep dive into XyloNet's technical architecture, design decisions, and system components.
        </p>
      </div>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">System Overview</h2>
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <p className="text-gray-300 mb-6">XyloNet is a modular DeFi protocol built on Arc Network, consisting of four main components:</p>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-[#0A786A]/10 to-[#0A786A]/5 border border-[#0A786A]/20 rounded-lg p-4">
              <h3 className="text-white font-semibold mb-2">StableSwap AMM</h3>
              <p className="text-gray-400 text-sm">Optimized for stablecoin swaps with minimal slippage using Curve's invariant algorithm.</p>
            </div>
            <div className="bg-gradient-to-br from-[#0A786A]/10 to-[#0A786A]/5 border border-[#0A786A]/20 rounded-lg p-4">
              <h3 className="text-white font-semibold mb-2">CCTP Bridge</h3>
              <p className="text-gray-400 text-sm">Native USDC bridging using Circle's Cross-Chain Transfer Protocol V2.</p>
            </div>
            <div className="bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/20 rounded-lg p-4">
              <h3 className="text-white font-semibold mb-2">Liquidity Pools</h3>
              <p className="text-gray-400 text-sm">Factory-deployed pools with LP token rewards and fee distribution.</p>
            </div>
            <div className="bg-gradient-to-br from-cyan-500/10 to-cyan-600/5 border border-cyan-500/20 rounded-lg p-4">
              <h3 className="text-white font-semibold mb-2">ERC-4626 Vault</h3>
              <p className="text-gray-400 text-sm">Tokenized vault for yield generation with standardized interface.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">Component Architecture</h2>
        <div className="bg-[#0f172a] border border-white/10 rounded-xl p-6">
          <div className="text-center mb-6"><p className="text-gray-400 text-sm">XyloNet Protocol Architecture</p></div>
          <div className="mb-6">
            <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4 text-center">
              <p className="text-blue-400 font-semibold">Frontend</p>
            </div>
          </div>
          <div className="flex justify-center mb-6"><div className="w-0.5 h-8 bg-gradient-to-b from-[#0A786A] to-[#01C38E]"></div></div>
          <div className="grid md:grid-cols-4 gap-4 mb-6">
            <div className="bg-[#0A786A]/20 border border-[#0A786A]/30 rounded-lg p-4 text-center">
              <p className="text-[#0A786A] font-semibold text-sm">XyloRouter</p>
              <p className="text-gray-500 text-xs mt-1">Swap routing</p>
            </div>
            <div className="bg-[#0A786A]/20 border border-[#0A786A]/30 rounded-lg p-4 text-center">
              <p className="text-[#0A786A] font-semibold text-sm">XyloFactory</p>
              <p className="text-gray-500 text-xs mt-1">Pool deployment</p>
            </div>
            <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-4 text-center">
              <p className="text-yellow-400 font-semibold text-sm">XyloBridge</p>
              <p className="text-yellow-200/60 text-xs mt-1">Contract deployed</p>
            </div>
            <div className="bg-[#0A786A]/20 border border-[#0A786A]/30 rounded-lg p-4 text-center">
              <p className="text-[#0A786A] font-semibold text-sm">XyloVault</p>
              <p className="text-gray-500 text-xs mt-1">Yield vault</p>
            </div>
          </div>
          <div className="flex justify-center mb-6"><div className="w-0.5 h-8 bg-gradient-to-b from-[#0A786A] to-green-500"></div></div>
          <div className="grid md:grid-cols-2 gap-4 mb-6 max-w-lg mx-auto">
            <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4 text-center">
              <div className="flex justify-center gap-1 mb-2">
                <img src="/tokens/usdc.svg" alt="USDC" className="w-5 h-5" />
                <img src="/tokens/eurc.png" alt="EURC" className="w-5 h-5" />
              </div>
              <p className="text-green-400 font-semibold text-sm">USDC/EURC Pool</p>
            </div>
            <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4 text-center">
              <div className="flex justify-center gap-1 mb-2">
                <img src="/tokens/usdc.svg" alt="USDC" className="w-5 h-5" />
                <img src="/tokens/usyc.png" alt="USYC" className="w-5 h-5" />
              </div>
              <p className="text-green-400 font-semibold text-sm">USDC/USYC Pool</p>
            </div>
          </div>
          <div className="flex justify-center mb-6"><div className="w-0.5 h-8 bg-gradient-to-b from-green-500 to-cyan-500"></div></div>
          <div className="bg-cyan-500/20 border border-cyan-500/30 rounded-lg p-4 text-center">
            <div className="flex justify-center gap-2 mb-2"><img src="/chains/arc.png" alt="Arc" className="w-6 h-6" /></div>
            <p className="text-cyan-400 font-semibold">Arc Network</p>
            <p className="text-gray-500 text-xs mt-1">L1 with native USDC gas</p>
          </div>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">StableSwap Algorithm</h2>
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <p className="text-gray-300 mb-6">XyloNet implements the StableSwap invariant, originally designed by Curve Finance. This algorithm is specifically optimized for trading assets that should maintain similar values.</p>
          <div className="bg-[#0f172a] rounded-lg p-4 mb-6 font-mono">
            <p className="text-gray-400 text-sm mb-2">// StableSwap Invariant</p>
            <p className="text-blue-400">An^n * sum(x_i) + D = An^n * D + D^(n+1) / (n^n * prod(x_i))</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-white font-semibold mb-3">Constant Product (xy=k)</h4>
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                <p className="text-gray-400 text-sm mb-2">Traditional AMMs:</p>
                <ul className="text-red-200 text-sm space-y-1">
                  <li>• High slippage even for small trades</li>
                  <li>• Inefficient for stable pairs</li>
                </ul>
              </div>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3">StableSwap (XyloNet)</h4>
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                <p className="text-gray-400 text-sm mb-2">Curve-style AMM:</p>
                <ul className="text-green-200 text-sm space-y-1">
                  <li>• Near-zero slippage at peg</li>
                  <li>• Optimized for stable assets</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">Amplification Factor</h2>
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <p className="text-gray-300 mb-4">The amplification factor (A) determines how the curve behaves:</p>
          <ul className="space-y-3 text-gray-300 mb-6">
            <li className="flex items-start gap-3"><span className="text-blue-400 font-bold">A = 0:</span><span>Behaves like constant product (x*y=k)</span></li>
            <li className="flex items-start gap-3"><span className="text-blue-400 font-bold">A = ∞:</span><span>Behaves like constant sum (x+y=k)</span></li>
            <li className="flex items-start gap-3"><span className="text-green-400 font-bold">A = 100:</span><span>XyloNet's default - optimal for stablecoins</span></li>
          </ul>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">CCTP Integration</h2>
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xl">⚡</span>
              <h4 className="text-green-400 font-semibold">Frontend Uses Circle Bridge Kit</h4>
            </div>
            <p className="text-gray-300 text-sm">
              For optimal user experience, XyloNet's frontend integrates directly with <strong className="text-white">Circle Bridge Kit</strong> 
              using <strong className="text-green-400">Fast Transfer mode (~30 seconds)</strong>. The XyloBridge contract is deployed but 
              not used by the frontend - it's available for developers who need programmatic access.
            </p>
          </div>
          <p className="text-gray-300 mb-4">Circle's CCTP V2 protocol enables trustless native USDC transfers:</p>
          <div className="bg-[#0f172a] rounded-lg p-4">
            <ol className="space-y-3 text-sm text-gray-300">
              <li className="flex items-start gap-3"><span className="text-blue-400 font-mono">1.</span><span>User initiates bridge via Bridge Kit</span></li>
              <li className="flex items-start gap-3"><span className="text-blue-400 font-mono">2.</span><span>USDC is burned on source chain</span></li>
              <li className="flex items-start gap-3"><span className="text-blue-400 font-mono">3.</span><span>Circle attestation (fast mode - ~seconds)</span></li>
              <li className="flex items-start gap-3"><span className="text-blue-400 font-mono">4.</span><span>Circle relayer automatically mints on destination</span></li>
              <li className="flex items-start gap-3"><span className="text-green-400 font-mono">✓</span><span>Native USDC delivered to recipient (~30 sec total)</span></li>
            </ol>
          </div>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">ERC-4626 Vault Standard</h2>
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <p className="text-gray-300 mb-6">XyloVault implements the ERC-4626 tokenized vault standard for maximum composability:</p>
          <div className="bg-[#0f172a] rounded-lg p-4 mb-6 font-mono text-sm">
            <p className="text-[#0A786A]">deposit(assets, receiver) → shares</p>
            <p className="text-[#0A786A]">withdraw(assets, receiver, owner) → shares</p>
            <p className="text-[#0A786A]">redeem(shares, receiver, owner) → assets</p>
            <p className="text-[#0A786A]">totalAssets() → uint256</p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-white mb-6">Security Model</h2>
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-white font-semibold mb-3">Smart Contract Security</h4>
              <ul className="text-gray-300 text-sm space-y-2">
                <li className="flex items-start gap-2"><span className="text-green-400">✓</span><span>Reentrancy guards on all external calls</span></li>
                <li className="flex items-start gap-2"><span className="text-green-400">✓</span><span>SafeMath for all arithmetic</span></li>
                <li className="flex items-start gap-2"><span className="text-green-400">✓</span><span>Access control on admin functions</span></li>
                <li className="flex items-start gap-2"><span className="text-green-400">✓</span><span>Input validation and bounds checking</span></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3">Protocol Security</h4>
              <ul className="text-gray-300 text-sm space-y-2">
                <li className="flex items-start gap-2"><span className="text-green-400">✓</span><span>Non-custodial design</span></li>
                <li className="flex items-start gap-2"><span className="text-green-400">✓</span><span>Circle-secured bridging (CCTP)</span></li>
                <li className="flex items-start gap-2"><span className="text-green-400">✓</span><span>Battle-tested Curve algorithm</span></li>
                <li className="flex items-start gap-2"><span className="text-green-400">✓</span><span>Transparent, open-source code</span></li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
