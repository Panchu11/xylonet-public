'use client'

export default function QuickStartPage() {
  return (
    <div className="prose prose-invert max-w-none">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-white mb-4">Quick Start Guide</h1>
        <p className="text-xl text-gray-400">
          Get started with XyloNet in under 5 minutes. This guide walks you through the essential steps
          to start swapping, bridging, and earning yield.
        </p>
      </div>

      {/* Prerequisites */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
          <span className="w-8 h-8 rounded-full bg-[#01C38E]/20 flex items-center justify-center text-[#01C38E] text-sm font-bold">1</span>
          Prerequisites
        </h2>
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <ul className="space-y-4 text-gray-300">
            <li className="flex items-start gap-3">
              <span className="text-green-400 mt-1">✓</span>
              <div>
                <strong className="text-white">Web3 Wallet</strong>
                <p className="text-sm text-gray-400 mt-1">MetaMask, Rabby, or any WalletConnect compatible wallet</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-green-400 mt-1">✓</span>
              <div>
                <strong className="text-white">USDC Tokens</strong>
                <p className="text-sm text-gray-400 mt-1">Native USDC on any supported chain (Ethereum, Arbitrum, Base, Optimism, Polygon)</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-green-400 mt-1">✓</span>
              <div>
                <strong className="text-white">No Gas Required on Arc</strong>
                <p className="text-sm text-gray-400 mt-1">Arc Network uses USDC as gas, so all you need is USDC!</p>
              </div>
            </li>
          </ul>
        </div>
      </section>

      {/* Step 1: Connect Wallet */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
          <span className="w-8 h-8 rounded-full bg-[#01C38E]/20 flex items-center justify-center text-[#01C38E] text-sm font-bold">2</span>
          Connect Your Wallet
        </h2>
        <div className="space-y-4">
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <ol className="space-y-4 text-gray-300">
              <li className="flex items-start gap-3">
                <span className="text-[#01C38E] font-bold">1.</span>
                <span>Visit <a href="https://xylonet.com" className="text-[#01C38E] hover:text-[#0A786A]">xylonet.com</a> and click the <strong className="text-white">"Connect Wallet"</strong> button in the header</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#01C38E] font-bold">2.</span>
                <span>Select your wallet provider from the modal (MetaMask, WalletConnect, Coinbase Wallet, etc.)</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#01C38E] font-bold">3.</span>
                <span>Approve the connection request in your wallet</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#01C38E] font-bold">4.</span>
                <span>If prompted, add Arc Testnet to your wallet (Chain ID: 5042002)</span>
              </li>
            </ol>
          </div>

          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
            <p className="text-yellow-200 text-sm flex items-start gap-2">
              <span className="text-yellow-400">💡</span>
              <span>XyloNet uses RainbowKit for wallet connections, supporting 50+ wallet providers with a seamless user experience.</span>
            </p>
          </div>
        </div>
      </section>

      {/* Step 2: Get USDC */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
          <span className="w-8 h-8 rounded-full bg-[#01C38E]/20 flex items-center justify-center text-[#01C38E] text-sm font-bold">3</span>
          Get USDC on Arc Network
        </h2>
        <div className="space-y-6">
          {/* Faucet */}
          <div className="bg-gradient-to-r from-[#0A786A]/10 to-[#01C38E]/10 border border-[#01C38E]/30 rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <span className="text-2xl">🚰</span>
              Get Testnet USDC from Circle Faucet
            </h3>
            <ol className="space-y-3 text-gray-300">
              <li className="flex items-start gap-3">
                <span className="text-[#01C38E] font-bold">1.</span>
                <span>Visit <a href="https://faucet.circle.com" target="_blank" rel="noopener" className="text-[#01C38E] hover:text-[#0A786A]">Circle's USDC Faucet</a></span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#01C38E] font-bold">2.</span>
                <span>Select "Arc Testnet" from the network dropdown</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#01C38E] font-bold">3.</span>
                <span>Enter your wallet address</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#01C38E] font-bold">4.</span>
                <span>Complete the captcha and click "Get Tokens"</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#01C38E] font-bold">5.</span>
                <span>Receive testnet USDC directly to your wallet</span>
              </li>
            </ol>
          </div>
        </div>
      </section>

      {/* Step 3: Start Using XyloNet */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
          <span className="w-8 h-8 rounded-full bg-[#01C38E]/20 flex items-center justify-center text-[#01C38E] text-sm font-bold">4</span>
          Start Using XyloNet
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          {/* Swap Card */}
          <a href="/docs/swap" className="group bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all hover:border-[#01C38E]/50">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-[#01C38E]/20 flex items-center justify-center">
                <svg className="w-6 h-6 text-[#01C38E]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white">Swap Stablecoins</h3>
            </div>
            <p className="text-gray-400 text-sm mb-4">
              Swap between USDC, EURC, and USYC with minimal slippage using our StableSwap AMM.
            </p>
            <div className="flex items-center gap-2">
              <img src="/tokens/usdc.svg" alt="USDC" className="w-5 h-5" />
              <span className="text-gray-500">↔</span>
              <img src="/tokens/eurc.png" alt="EURC" className="w-5 h-5" />
              <span className="text-gray-500">↔</span>
              <img src="/tokens/usyc.png" alt="USYC" className="w-5 h-5" />
            </div>
          </a>

          {/* Bridge Card */}
          <a href="/docs/bridge" className="group bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all hover:border-[#0A786A]/50">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-[#0A786A]/20 flex items-center justify-center">
                <svg className="w-6 h-6 text-[#0A786A]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white">Bridge USDC</h3>
            </div>
            <p className="text-gray-400 text-sm mb-4">
              Bridge USDC from Arc to other chains in ~30 seconds via Circle's CCTP V2 Fast Transfer.
            </p>
            <div className="flex items-center gap-1">
              <img src="/chains/arc.png" alt="Arc" className="w-5 h-5" />
              <span className="text-gray-500 text-sm ml-2">→</span>
              <img src="/chains/ethereum.svg" alt="ETH" className="w-5 h-5 ml-2" />
              <img src="/chains/arbitrum.svg" alt="ARB" className="w-5 h-5" />
              <img src="/chains/base.jpg" alt="Base" className="w-5 h-5 rounded-full" />
              <img src="/chains/optimism.svg" alt="OP" className="w-5 h-5" />
            </div>
          </a>

          {/* Pools Card */}
          <a href="/docs/pools" className="group bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all hover:border-[#01C38E]/50">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-[#01C38E]/20 flex items-center justify-center">
                <svg className="w-6 h-6 text-[#01C38E]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white">Provide Liquidity</h3>
            </div>
            <p className="text-gray-400 text-sm mb-4">
              Earn trading fees by providing liquidity to stablecoin pools.
            </p>
            <div className="text-sm text-[#01C38E]">Earn 0.04% per trade</div>
          </a>

          {/* Vault Card */}
          <a href="/docs/vault" className="group bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all hover:border-[#0A786A]/50">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-[#0A786A]/20 flex items-center justify-center">
                <svg className="w-6 h-6 text-[#0A786A]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white">Earn Yield</h3>
            </div>
            <p className="text-gray-400 text-sm mb-4">
              Deposit USDC into the vault and earn yield automatically.
            </p>
            <div className="text-sm text-[#01C38E]">Deposit once, earn forever</div>
          </a>
        </div>
      </section>

      {/* What's Next */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">What's Next?</h2>
        <div className="bg-gradient-to-r from-[#0A786A]/10 to-[#01C38E]/10 border border-[#01C38E]/30 rounded-xl p-6">
          <ul className="space-y-3 text-gray-300">
            <li className="flex items-center gap-3">
              <span className="text-[#01C38E]">→</span>
              <a href="/docs/network" className="hover:text-[#01C38E] transition-colors">Learn more about Arc Network</a>
            </li>
            <li className="flex items-center gap-3">
              <span className="text-[#01C38E]">→</span>
              <a href="/docs/architecture" className="hover:text-[#01C38E] transition-colors">Understand XyloNet's architecture</a>
            </li>
            <li className="flex items-center gap-3">
              <span className="text-[#01C38E]">→</span>
              <a href="/docs/contracts" className="hover:text-[#01C38E] transition-colors">View deployed smart contracts</a>
            </li>
            <li className="flex items-center gap-3">
              <span className="text-[#01C38E]">→</span>
              <a href="/docs/integration" className="hover:text-[#01C38E] transition-colors">Integrate XyloNet into your dApp</a>
            </li>
          </ul>
        </div>
      </section>

      {/* Need Help */}
      <section>
        <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-center">
          <h3 className="text-xl font-bold text-white mb-2">Need Help?</h3>
          <p className="text-gray-400 mb-4">
            Join our community for support and updates.
          </p>
          <div className="flex justify-center gap-4">
            <a href="https://x.com/Xylonet_" target="_blank" rel="noopener" className="px-4 py-2 bg-[#01C38E]/20 text-[#01C38E] rounded-lg hover:bg-[#01C38E]/30 transition-colors">
              X (Twitter)
            </a>
            <a href="https://discord.gg/mcDkHNrFyA" target="_blank" rel="noopener" className="px-4 py-2 bg-[#0A786A]/20 text-[#0A786A] rounded-lg hover:bg-[#0A786A]/30 transition-colors">
              Discord
            </a>
            <span className="px-4 py-2 bg-gray-500/10 text-gray-500 rounded-lg cursor-not-allowed">
              GitHub (Coming Soon)
            </span>
          </div>
        </div>
      </section>
    </div>
  )
}
