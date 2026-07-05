'use client';

export default function ExtensionPage() {
  return (
    <div className="prose prose-invert max-w-none">
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-white mb-4">Chrome Extension</h1>
        <p className="text-xl text-gray-400">
          The PayX Chrome extension adds tipping functionality directly to X.com.
        </p>
      </div>

      {/* Overview */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">What It Does</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="p-5 bg-gradient-to-br from-indigo-500/10 to-indigo-600/5 border border-indigo-500/20 rounded-xl">
            <div className="text-3xl mb-3">💸</div>
            <h4 className="text-white font-semibold mb-2">Tip Buttons</h4>
            <p className="text-sm text-gray-400">Adds a &quot;Tip&quot; button below every tweet on X.com</p>
          </div>
          <div className="p-5 bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20 rounded-xl">
            <div className="text-3xl mb-3">👛</div>
            <h4 className="text-white font-semibold mb-2">Wallet Integration</h4>
            <p className="text-sm text-gray-400">Connect your wallet and manage tips from the popup</p>
          </div>
          <div className="p-5 bg-gradient-to-br from-cyan-500/10 to-cyan-600/5 border border-cyan-500/20 rounded-xl">
            <div className="text-3xl mb-3">📊</div>
            <h4 className="text-white font-semibold mb-2">Balance Tracking</h4>
            <p className="text-sm text-gray-400">View your USDC balance and tip history at a glance</p>
          </div>
        </div>
      </section>

      {/* Installation */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">Installation</h2>
        <div className="space-y-4">
          {/* Chrome Web Store - Coming Soon */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-6 opacity-60">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-indigo-500/20 rounded-xl flex items-center justify-center shrink-0">
                <svg className="w-7 h-7 text-indigo-400" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C8.21 0 4.831 1.757 2.632 4.501l3.953 6.848A5.454 5.454 0 0 1 12 6.545h10.691A12 12 0 0 0 12 0zM1.931 5.47A11.943 11.943 0 0 0 0 12c0 6.012 4.42 10.991 10.189 11.864l3.953-6.847a5.45 5.45 0 0 1-6.865-2.29zm13.342 2.166a5.446 5.446 0 0 1 1.45 7.09l.002.001h-.002l-3.953 6.848c.062.004.123.008.185.01A12.002 12.002 0 0 0 24 12c0-.029-.002-.058-.002-.087z"/>
                </svg>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-lg font-semibold text-white">Chrome Web Store</h3>
                  <span className="px-2 py-0.5 text-xs bg-yellow-500/20 text-yellow-400 rounded-full">Coming Soon</span>
                </div>
                <p className="text-gray-400 text-sm">
                  The extension will be available on Chrome Web Store soon. For now, use manual installation.
                </p>
              </div>
            </div>
          </div>

          {/* Manual Installation */}
          <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/30 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <span className="text-xl">🔧</span> Manual Installation (Developer Mode)
            </h3>
            <ol className="space-y-4 text-gray-300">
              <li className="flex items-start gap-3">
                <span className="text-indigo-400 font-bold">1.</span>
                <div>
                  <span>Download the extension folder from the repository</span>
                  <p className="text-xs text-gray-500 mt-1">Located at: <code className="text-indigo-400">/payx/apps/extension</code></p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-indigo-400 font-bold">2.</span>
                <span>Open Chrome and go to <code className="text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">chrome://extensions/</code></span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-indigo-400 font-bold">3.</span>
                <span>Enable <strong className="text-white">&quot;Developer mode&quot;</strong> in the top right corner</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-indigo-400 font-bold">4.</span>
                <span>Click <strong className="text-white">&quot;Load unpacked&quot;</strong> and select the extension folder</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-indigo-400 font-bold">5.</span>
                <span>Pin the PayX extension for easy access</span>
              </li>
            </ol>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">Features</h2>
        
        {/* Popup */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-4">
          <h3 className="text-white font-semibold mb-4">Extension Popup</h3>
          <p className="text-gray-400 text-sm mb-4">Click the PayX icon to access:</p>
          <ul className="space-y-3 text-gray-300 text-sm">
            <li className="flex items-start gap-3">
              <span className="text-emerald-400 mt-0.5">✓</span>
              <div>
                <strong className="text-white">Wallet Connection</strong>
                <p className="text-gray-500 text-xs mt-0.5">Connect MetaMask or other Web3 wallets</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-emerald-400 mt-0.5">✓</span>
              <div>
                <strong className="text-white">USDC Balance</strong>
                <p className="text-gray-500 text-xs mt-0.5">View your current USDC balance on Arc</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-emerald-400 mt-0.5">✓</span>
              <div>
                <strong className="text-white">Quick Links</strong>
                <p className="text-gray-500 text-xs mt-0.5">Access claim page and Arc Network resources</p>
              </div>
            </li>
          </ul>
        </div>

        {/* Tip Modal */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <h3 className="text-white font-semibold mb-4">Tip Modal</h3>
          <p className="text-gray-400 text-sm mb-4">When you click &quot;Tip&quot; on a tweet:</p>
          <ul className="space-y-3 text-gray-300 text-sm">
            <li className="flex items-start gap-3">
              <span className="text-emerald-400 mt-0.5">✓</span>
              <div>
                <strong className="text-white">Amount Selection</strong>
                <p className="text-gray-500 text-xs mt-0.5">Choose preset amounts ($1, $2, $5, $10) or enter custom</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-emerald-400 mt-0.5">✓</span>
              <div>
                <strong className="text-white">Optional Message</strong>
                <p className="text-gray-500 text-xs mt-0.5">Add a personal note to your tip (up to 280 chars)</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-emerald-400 mt-0.5">✓</span>
              <div>
                <strong className="text-white">Transaction Confirmation</strong>
                <p className="text-gray-500 text-xs mt-0.5">Review and confirm in your wallet</p>
              </div>
            </li>
          </ul>
        </div>
      </section>

      {/* Supported Sites */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">Supported Sites</h2>
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-7 h-7" fill="white">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </div>
            <div>
              <h4 className="text-white font-semibold">X.com (Twitter)</h4>
              <p className="text-sm text-gray-400">Full support for tipping on tweets</p>
            </div>
          </div>
          <div className="p-3 bg-white/5 rounded-lg border border-white/10">
            <p className="text-xs text-gray-500">
              The extension automatically detects tweets and adds tip buttons. Works on timeline, profiles, and individual tweet pages.
            </p>
          </div>
        </div>
      </section>

      {/* Permissions */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">Permissions</h2>
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <p className="text-gray-400 text-sm mb-4">The extension requires the following permissions:</p>
          <div className="space-y-3">
            <div className="p-3 bg-white/5 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-lg">🌐</span>
                  <span className="text-white">x.com / twitter.com</span>
                </div>
                <span className="text-xs text-gray-500">Content scripts</span>
              </div>
            </div>
            <div className="p-3 bg-white/5 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-lg">💾</span>
                  <span className="text-white">Storage</span>
                </div>
                <span className="text-xs text-gray-500">Save wallet connection</span>
              </div>
            </div>
          </div>
          <div className="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
            <p className="text-emerald-300 text-xs flex items-start gap-2">
              <span className="text-emerald-400">🔒</span>
              <span>PayX does NOT access your private keys. All transactions are signed by your wallet.</span>
            </p>
          </div>
        </div>
      </section>

      {/* Troubleshooting */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">Troubleshooting</h2>
        <div className="space-y-4">
          <div className="bg-white/5 border border-white/10 rounded-xl p-5">
            <h4 className="text-white font-semibold mb-2">Tip button not appearing?</h4>
            <ul className="text-sm text-gray-400 space-y-1">
              <li>• Refresh the X.com page</li>
              <li>• Make sure the extension is enabled in chrome://extensions</li>
              <li>• Try disabling and re-enabling the extension</li>
            </ul>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-5">
            <h4 className="text-white font-semibold mb-2">Wallet not connecting?</h4>
            <ul className="text-sm text-gray-400 space-y-1">
              <li>• Make sure MetaMask (or your wallet) is installed and unlocked</li>
              <li>• Check if you&apos;re on Arc Testnet (Chain ID: 5042002)</li>
              <li>• Try clicking &quot;Connect Wallet&quot; in the extension popup first</li>
            </ul>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-5">
            <h4 className="text-white font-semibold mb-2">Transaction failing?</h4>
            <ul className="text-sm text-gray-400 space-y-1">
              <li>• Ensure you have enough USDC for the tip + gas</li>
              <li>• Check that you&apos;ve approved USDC spending if prompted</li>
              <li>• Try increasing gas limit slightly</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Version */}
      <section>
        <h2 className="text-2xl font-bold text-white mb-6">Current Version</h2>
        <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-white font-semibold">PayX Extension</h3>
              <p className="text-gray-400 text-sm">Chrome Extension v2.0.0</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-indigo-500/20 text-indigo-400 rounded-full text-sm font-mono">v2.0.0</span>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-white/10">
            <p className="text-xs text-gray-500">
              Built by <span className="text-indigo-400 font-semibold">ForgeLabs</span> • Powered by Arc Network
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
