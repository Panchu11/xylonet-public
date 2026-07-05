'use client';

export default function QuickStartPage() {
  return (
    <div className="prose prose-invert max-w-none">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-white mb-4">Quick Start Guide</h1>
        <p className="text-xl text-gray-400">
          Get started with PayX in under 2 minutes. Check your pending tips and claim them instantly.
        </p>
      </div>

      {/* For Creators - Claiming Tips */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
          <span className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 text-sm font-bold">🎁</span>
          For Creators: Claim Your Tips
        </h2>
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <ol className="space-y-4 text-gray-300">
            <li className="flex items-start gap-3">
              <span className="text-indigo-400 font-bold">1.</span>
              <span>Visit <a href="/claim" className="text-indigo-400 hover:text-indigo-300">PayX Claim Page</a></span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-indigo-400 font-bold">2.</span>
              <span>Click <strong className="text-white">&quot;Sign in with X&quot;</strong> to verify your account</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-indigo-400 font-bold">3.</span>
              <span>See your pending tips balance instantly</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-indigo-400 font-bold">4.</span>
              <span>Connect your wallet and click <strong className="text-white">&quot;Claim&quot;</strong> to withdraw</span>
            </li>
          </ol>
        </div>

        <div className="mt-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4">
          <p className="text-emerald-200 text-sm flex items-start gap-2">
            <span className="text-emerald-400">✓</span>
            <span>Tips are claimed directly to your connected wallet. No intermediaries.</span>
          </p>
        </div>
      </section>

      {/* For Tippers - Sending Tips */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
          <span className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 text-sm font-bold">💸</span>
          For Tippers: Send Tips
        </h2>
        <div className="space-y-6">
          {/* Step 1: Install Extension */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">Step 1: Install Chrome Extension</h3>
            <ol className="space-y-3 text-gray-300">
              <li className="flex items-start gap-3">
                <span className="text-indigo-400 font-bold">1.</span>
                <span>Download the PayX extension from the Chrome Web Store (coming soon) or load manually</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-indigo-400 font-bold">2.</span>
                <span>Click the puzzle icon in Chrome and pin PayX for easy access</span>
              </li>
            </ol>
          </div>

          {/* Step 2: Get USDC */}
          <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/30 rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <img src="/tokens/usdc.svg" alt="USDC" className="w-6 h-6" />
              Step 2: Get Testnet USDC
            </h3>
            <ol className="space-y-3 text-gray-300">
              <li className="flex items-start gap-3">
                <span className="text-indigo-400 font-bold">1.</span>
                <span>Visit <a href="https://faucet.circle.com" target="_blank" rel="noopener" className="text-indigo-400 hover:text-indigo-300">Circle&apos;s USDC Faucet</a></span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-indigo-400 font-bold">2.</span>
                <span>Select <strong className="text-white">&quot;Arc Testnet&quot;</strong> from the network dropdown</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-indigo-400 font-bold">3.</span>
                <span>Enter your wallet address and request tokens</span>
              </li>
            </ol>
          </div>

          {/* Step 3: Start Tipping */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">Step 3: Start Tipping</h3>
            <ol className="space-y-3 text-gray-300">
              <li className="flex items-start gap-3">
                <span className="text-indigo-400 font-bold">1.</span>
                <span>Go to <a href="https://x.com" target="_blank" rel="noopener" className="text-indigo-400 hover:text-indigo-300">X.com</a> and find a tweet you want to tip</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-indigo-400 font-bold">2.</span>
                <span>Click the <strong className="text-white">&quot;💸 Tip&quot;</strong> button that appears below each tweet</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-indigo-400 font-bold">3.</span>
                <span>Select an amount or enter a custom amount (min $0.10)</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-indigo-400 font-bold">4.</span>
                <span>Confirm the transaction in your wallet</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-indigo-400 font-bold">5.</span>
                <span>Done! The creator will see your tip when they check PayX</span>
              </li>
            </ol>
          </div>
        </div>
      </section>

      {/* Network Setup */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
          <span className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400 text-sm font-bold">⚙️</span>
          Arc Network Setup
        </h2>
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <p className="text-gray-300 mb-4">
            PayX runs on Arc Testnet. Add it to your wallet using these details:
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 bg-white/5 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <img src="/chains/arc.png" alt="Arc" className="w-6 h-6" />
                <span className="font-semibold text-white">Arc Testnet</span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-gray-400">Chain ID:</span><span className="text-white font-mono">5042002</span></div>
                <div className="flex justify-between"><span className="text-gray-400">RPC URL:</span><span className="text-indigo-400 font-mono text-xs break-all">https://rpc.testnet.arc.network</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Currency:</span><span className="text-white">USDC</span></div>
              </div>
            </div>
            <div className="p-4 bg-white/5 rounded-lg">
              <h4 className="font-semibold text-white mb-3">Block Explorer</h4>
              <a href="https://testnet.arcscan.app" target="_blank" rel="noopener" className="inline-flex items-center gap-2 text-indigo-400 hover:text-indigo-300">
                testnet.arcscan.app
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* What&apos;s Next */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">What&apos;s Next?</h2>
        <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/30 rounded-xl p-6">
          <ul className="space-y-3 text-gray-300">
            <li className="flex items-center gap-3">
              <span className="text-indigo-400">→</span>
              <a href="/docs/tipping" className="hover:text-indigo-400 transition-colors">Learn how tipping works in detail</a>
            </li>
            <li className="flex items-center gap-3">
              <span className="text-indigo-400">→</span>
              <a href="/docs/extension" className="hover:text-indigo-400 transition-colors">Explore extension features</a>
            </li>
            <li className="flex items-center gap-3">
              <span className="text-indigo-400">→</span>
              <a href="/docs/contracts" className="hover:text-indigo-400 transition-colors">View smart contract details</a>
            </li>
            <li className="flex items-center gap-3">
              <span className="text-indigo-400">→</span>
              <a href="/docs/faq" className="hover:text-indigo-400 transition-colors">Check frequently asked questions</a>
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
            <a href="https://x.com/Xylonet_" target="_blank" rel="noopener" className="px-4 py-2 bg-indigo-500/20 text-indigo-400 rounded-lg hover:bg-indigo-500/30 transition-colors">
              X (Twitter)
            </a>
            <a href="https://discord.gg/mcDkHNrFyA" target="_blank" rel="noopener" className="px-4 py-2 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30 transition-colors">
              Discord
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
