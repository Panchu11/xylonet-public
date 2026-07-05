'use client'

export default function SecurityPage() {
  return (
    <div className="prose prose-invert max-w-none">
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-white mb-4">Security</h1>
        <p className="text-xl text-gray-400">
          XyloNet's security practices, risk considerations, and safety measures.
        </p>
      </div>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">Security Overview</h2>
        <div className="bg-gradient-to-br from-green-500/10 to-cyan-500/10 border border-green-500/20 rounded-xl p-6">
          <p className="text-gray-300 mb-6">
            XyloNet is designed with security as a top priority. Our contracts implement industry-standard 
            security patterns and are built on battle-tested protocols.
          </p>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-white/5 rounded-lg p-4 text-center">
              <div className="text-3xl mb-2">🔒</div>
              <h4 className="text-white font-semibold">Non-Custodial</h4>
              <p className="text-gray-400 text-sm">You always control your funds</p>
            </div>
            <div className="bg-white/5 rounded-lg p-4 text-center">
              <div className="text-3xl mb-2">🛡️</div>
              <h4 className="text-white font-semibold">Open Source</h4>
              <p className="text-gray-400 text-sm">Fully verifiable code</p>
            </div>
            <div className="bg-white/5 rounded-lg p-4 text-center">
              <div className="text-3xl mb-2">✅</div>
              <h4 className="text-white font-semibold">Battle-Tested</h4>
              <p className="text-gray-400 text-sm">Based on proven algorithms</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">Smart Contract Security</h2>
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <h3 className="text-lg font-bold text-white mb-4">Security Measures</h3>
          <ul className="space-y-4">
            <li className="flex items-start gap-3">
              <span className="text-green-400 mt-1">✓</span>
              <div>
                <strong className="text-white">Reentrancy Protection</strong>
                <p className="text-gray-400 text-sm mt-1">All external calls use reentrancy guards to prevent recursive attacks</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-green-400 mt-1">✓</span>
              <div>
                <strong className="text-white">Integer Overflow Protection</strong>
                <p className="text-gray-400 text-sm mt-1">Solidity 0.8+ with built-in overflow checks</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-green-400 mt-1">✓</span>
              <div>
                <strong className="text-white">Access Control</strong>
                <p className="text-gray-400 text-sm mt-1">Role-based permissions for administrative functions</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-green-400 mt-1">✓</span>
              <div>
                <strong className="text-white">Input Validation</strong>
                <p className="text-gray-400 text-sm mt-1">All user inputs are validated with proper bounds checking</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-green-400 mt-1">✓</span>
              <div>
                <strong className="text-white">Slippage Protection</strong>
                <p className="text-gray-400 text-sm mt-1">Minimum output amounts prevent sandwich attacks</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-green-400 mt-1">✓</span>
              <div>
                <strong className="text-white">Deadline Parameters</strong>
                <p className="text-gray-400 text-sm mt-1">Transaction deadlines prevent stale transaction execution</p>
              </div>
            </li>
          </ul>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">Protocol Dependencies</h2>
        <div className="space-y-4">
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                <img src="/tokens/usdc.svg" alt="Circle" className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Circle CCTP</h3>
            </div>
            <p className="text-gray-300 mb-3">
              The bridge relies on Circle's Cross-Chain Transfer Protocol for native USDC transfers. 
              CCTP is secured by Circle's attestation service and institutional-grade infrastructure.
            </p>
            <a href="https://developers.circle.com/stablecoins/cctp-getting-started" target="_blank" rel="noopener" className="text-blue-400 text-sm hover:text-blue-300">
              Learn more about CCTP security →
            </a>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-[#0A786A]/20 flex items-center justify-center">
                <span className="text-xl">📐</span>
              </div>
              <h3 className="text-lg font-bold text-white">Curve StableSwap</h3>
            </div>
            <p className="text-gray-300 mb-3">
              Our AMM algorithm is based on Curve Finance's StableSwap invariant, which has secured 
              billions of dollars in TVL and has been battle-tested since 2020.
            </p>
            <a href="https://docs.curve.finance/references/whitepaper/" target="_blank" rel="noopener" className="text-blue-400 text-sm hover:text-blue-300">
              Read the Curve whitepaper →
            </a>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                <span className="text-xl">🏦</span>
              </div>
              <h3 className="text-lg font-bold text-white">ERC-4626 Standard</h3>
            </div>
            <p className="text-gray-300 mb-3">
              The vault implements the standardized ERC-4626 interface, reducing implementation risk 
              through a well-audited, widely-adopted standard.
            </p>
            <a href="https://eips.ethereum.org/EIPS/eip-4626" target="_blank" rel="noopener" className="text-blue-400 text-sm hover:text-blue-300">
              View EIP-4626 specification →
            </a>
          </div>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">Risk Considerations</h2>
        <div className="space-y-4">
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-6">
            <h3 className="text-yellow-200 font-semibold mb-3 flex items-center gap-2">
              <span className="text-yellow-400">⚠️</span>
              Smart Contract Risk
            </h3>
            <p className="text-yellow-200/80 text-sm">
              Despite security measures, smart contracts may contain undiscovered vulnerabilities. 
              Only deposit funds you can afford to lose and consider starting with smaller amounts.
            </p>
          </div>

          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-6">
            <h3 className="text-yellow-200 font-semibold mb-3 flex items-center gap-2">
              <span className="text-yellow-400">⚠️</span>
              Stablecoin Depeg Risk
            </h3>
            <p className="text-yellow-200/80 text-sm">
              While rare, stablecoins can temporarily or permanently depeg from their target value. 
              The StableSwap curve amplifies losses if tokens significantly depeg.
            </p>
          </div>

          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-6">
            <h3 className="text-yellow-200 font-semibold mb-3 flex items-center gap-2">
              <span className="text-yellow-400">⚠️</span>
              Bridge Risk
            </h3>
            <p className="text-yellow-200/80 text-sm">
              While CCTP is secured by Circle, cross-chain transfers involve additional trust 
              assumptions. Ensure you understand the attestation process.
            </p>
          </div>

          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-6">
            <h3 className="text-yellow-200 font-semibold mb-3 flex items-center gap-2">
              <span className="text-yellow-400">⚠️</span>
              Network Risk
            </h3>
            <p className="text-yellow-200/80 text-sm">
              Arc Network is currently in testnet phase. Expect potential network instability, 
              resets, and changes before mainnet launch.
            </p>
          </div>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">Security Best Practices</h2>
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <h3 className="text-lg font-bold text-white mb-4">For Users</h3>
          <ul className="space-y-3 text-gray-300">
            <li className="flex items-start gap-3">
              <span className="text-blue-400">1.</span>
              <span>Always verify contract addresses before interacting</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-blue-400">2.</span>
              <span>Use hardware wallets for significant holdings</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-blue-400">3.</span>
              <span>Set appropriate slippage tolerance for swaps</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-blue-400">4.</span>
              <span>Review transaction details in your wallet before signing</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-blue-400">5.</span>
              <span>Revoke unused token approvals periodically</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-blue-400">6.</span>
              <span>Be cautious of phishing sites - bookmark official URLs</span>
            </li>
          </ul>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-white mb-6">Emergency Contacts</h2>
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <p className="text-gray-300 mb-4">If you discover a critical vulnerability or security incident:</p>
          <div className="flex flex-wrap gap-4">
            <a href="https://x.com/Xylonet_" target="_blank" rel="noopener" className="px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors">
              X (Twitter) @Xylonet_
            </a>
            <a href="https://discord.gg/mcDkHNrFyA" target="_blank" rel="noopener" className="px-4 py-2 bg-[#0A786A]/20 text-[#0A786A] rounded-lg hover:bg-[#0A786A]/30 transition-colors">
              Discord
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
