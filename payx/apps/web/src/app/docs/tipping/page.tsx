'use client';

export default function TippingPage() {
  return (
    <div className="prose prose-invert max-w-none">
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-white mb-4">How Tipping Works</h1>
        <p className="text-xl text-gray-400">
          Understand the complete tipping flow — from sending a tip to the creator claiming it.
        </p>
      </div>

      {/* Overview */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">Overview</h2>
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <p className="text-gray-300 mb-4">
            PayX uses an <strong className="text-white">escrow-based tipping system</strong>. When you tip someone on X:
          </p>
          <ol className="space-y-3 text-gray-300">
            <li className="flex items-start gap-3">
              <span className="text-indigo-400 font-bold">1.</span>
              <span>Your USDC is transferred from your wallet to the PayX smart contract</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-indigo-400 font-bold">2.</span>
              <span>The tip is associated with the recipient&apos;s X handle (e.g., @username)</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-indigo-400 font-bold">3.</span>
              <span>Tips accumulate in escrow until the creator claims them</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-indigo-400 font-bold">4.</span>
              <span>Creator verifies ownership via X OAuth and claims to their wallet</span>
            </li>
          </ol>
        </div>
      </section>

      {/* Tip Flow Diagram */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">Tipping Flow</h2>
        <div className="grid md:grid-cols-4 gap-4">
          <div className="p-5 bg-gradient-to-br from-indigo-500/10 to-indigo-600/5 border border-indigo-500/20 rounded-xl text-center">
            <div className="w-12 h-12 bg-indigo-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <h4 className="text-white font-semibold mb-2">Find Tweet</h4>
            <p className="text-xs text-gray-400">Browse X and find content you want to tip</p>
          </div>
          
          <div className="p-5 bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20 rounded-xl text-center">
            <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
              </svg>
            </div>
            <h4 className="text-white font-semibold mb-2">Click Tip</h4>
            <p className="text-xs text-gray-400">Select amount and confirm in extension</p>
          </div>
          
          <div className="p-5 bg-gradient-to-br from-cyan-500/10 to-cyan-600/5 border border-cyan-500/20 rounded-xl text-center">
            <div className="w-12 h-12 bg-cyan-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
              <img src="/tokens/usdc.svg" alt="USDC" className="w-6 h-6" />
            </div>
            <h4 className="text-white font-semibold mb-2">USDC Transferred</h4>
            <p className="text-xs text-gray-400">Funds move to escrow contract</p>
          </div>
          
          <div className="p-5 bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border border-emerald-500/20 rounded-xl text-center">
            <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h4 className="text-white font-semibold mb-2">Tip Recorded</h4>
            <p className="text-xs text-gray-400">On-chain event emitted</p>
          </div>
        </div>
      </section>

      {/* Tip Amounts */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">Tip Amounts</h2>
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-white font-semibold mb-4">Preset Amounts</h3>
              <div className="flex flex-wrap gap-2">
                {['$1', '$2', '$5', '$10'].map((amount) => (
                  <div key={amount} className="px-4 py-2 bg-indigo-500/20 border border-indigo-500/30 rounded-lg text-indigo-300 font-semibold">
                    {amount}
                  </div>
                ))}
              </div>
              <p className="text-sm text-gray-400 mt-3">Quick select common amounts</p>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Custom Amounts</h3>
              <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                <div className="flex items-center gap-2">
                  <img src="/tokens/usdc.svg" alt="USDC" className="w-5 h-5" />
                  <span className="text-gray-400">Min: $0.10</span>
                  <span className="text-gray-600">|</span>
                  <span className="text-gray-400">Max: Unlimited</span>
                </div>
              </div>
              <p className="text-sm text-gray-400 mt-3">Enter any amount above minimum</p>
            </div>
          </div>
        </div>
      </section>

      {/* Fees */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">Fees</h2>
        <div className="space-y-4">
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-white font-semibold">Platform Fee</h3>
                <p className="text-sm text-gray-400">Charged on each tip</p>
              </div>
              <div className="text-2xl font-bold text-indigo-400">1%</div>
            </div>
            <div className="text-sm text-gray-400">
              <p>Example: On a $10 tip, $0.10 goes to platform fees, $9.90 goes to the creator.</p>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-white font-semibold">Gas Fee</h3>
                <p className="text-sm text-gray-400">Arc Network transaction cost</p>
              </div>
              <div className="text-2xl font-bold text-cyan-400">~$0.01</div>
            </div>
            <div className="text-sm text-gray-400">
              <p>Gas is paid in USDC on Arc Network. Extremely low cost per transaction.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Tip Messages */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">Tip Messages</h2>
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <p className="text-gray-300 mb-4">
            You can include an optional message with your tip (up to 280 characters, like a tweet!). 
            Messages are stored on-chain and visible to the recipient.
          </p>
          <div className="bg-white/5 border border-white/10 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-indigo-500/20 rounded-full flex items-center justify-center text-indigo-400 text-sm">💬</div>
              <div>
                <p className="text-white text-sm">&quot;Great thread! Really helped me understand the concept.&quot;</p>
                <p className="text-xs text-gray-500 mt-1">Example tip message</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* On-Chain Data */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">On-Chain Events</h2>
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <p className="text-gray-300 mb-4">
            Every tip emits a <code className="text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">TipSent</code> event containing:
          </p>
          <div className="bg-[#0a0b0f] rounded-lg p-4 font-mono text-sm overflow-x-auto">
            <pre className="text-gray-300">
{`event TipSent(
    string indexed handleHash,  // Keccak256 of handle
    string handle,              // "@username"
    address indexed tipper,     // Sender wallet
    uint256 amount,             // Net tip amount
    uint256 fee,                // Platform fee
    string message,             // Optional message
    uint256 timestamp           // Block timestamp
);`}
            </pre>
          </div>
          <p className="text-sm text-gray-400 mt-4">
            All tips are fully transparent and queryable on{' '}
            <a href="https://testnet.arcscan.app/address/0xA312c384770B7b49E371DF4b7AF730EFEF465913" target="_blank" rel="noopener" className="text-indigo-400 hover:text-indigo-300">
              ArcScan
            </a>.
          </p>
        </div>
      </section>

      {/* Tips for Tippers */}
      <section>
        <h2 className="text-2xl font-bold text-white mb-6">Best Practices</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-5 bg-white/5 border border-white/10 rounded-xl">
            <div className="text-2xl mb-3">✅</div>
            <h4 className="text-white font-semibold mb-2">Do</h4>
            <ul className="text-sm text-gray-400 space-y-2">
              <li>• Double-check the X handle before tipping</li>
              <li>• Include a nice message to make it personal</li>
              <li>• Start with small amounts to test</li>
            </ul>
          </div>
          <div className="p-5 bg-white/5 border border-white/10 rounded-xl">
            <div className="text-2xl mb-3">❌</div>
            <h4 className="text-white font-semibold mb-2">Don&apos;t</h4>
            <ul className="text-sm text-gray-400 space-y-2">
              <li>• Tip fake/impersonator accounts</li>
              <li>• Include sensitive info in messages</li>
              <li>• Expect immediate response from creators</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
