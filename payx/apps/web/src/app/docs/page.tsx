import Link from 'next/link';
import Image from 'next/image';

export default function DocsPage() {
  return (
    <div>
      {/* Hero */}
      <div className="mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-pulse" />
          <span className="text-xs text-indigo-400 font-medium">Live on Arc Testnet</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
          PayX Documentation
        </h1>
        <p className="text-xl text-gray-400 leading-relaxed">
          Welcome to PayX — the easiest way to tip creators on X/Twitter using USDC on Arc Network.
          Send instant tips to anyone, no wallet needed to receive.
        </p>
      </div>

      {/* What is PayX */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">What is PayX?</h2>
        <p className="text-gray-400 mb-6 leading-relaxed">
          PayX is a tipping protocol built on Arc Network that enables anyone to send USDC tips to 
          X/Twitter creators. Tips are held in an escrow smart contract until the creator verifies 
          their X account via OAuth and claims them to any wallet.
        </p>
        
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="p-5 bg-white/[0.02] border border-white/5 rounded-xl">
            <div className="flex items-center gap-3 mb-3">
              <img src="/tokens/usdc.svg" alt="USDC" className="w-8 h-8" />
              <span className="text-white font-semibold">USDC Native</span>
            </div>
            <p className="text-sm text-gray-400">
              Tips are sent in real USDC — Circle&apos;s official stablecoin. No wrapped or fake tokens.
            </p>
          </div>
          <div className="p-5 bg-white/[0.02] border border-white/5 rounded-xl">
            <div className="flex items-center gap-3 mb-3">
              <img src="/chains/arc.png" alt="Arc" className="w-8 h-8" />
              <span className="text-white font-semibold">Sub-Second Finality</span>
            </div>
            <p className="text-sm text-gray-400">
              Arc Network delivers &lt;350ms transaction finality. Tips arrive instantly.
            </p>
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">Key Features</h2>
        <div className="space-y-4">
          <Link href="/docs/tipping" className="block p-5 bg-gradient-to-r from-indigo-500/5 to-transparent border border-white/5 hover:border-indigo-500/30 rounded-xl transition-all group">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-indigo-500/20 rounded-lg flex items-center justify-center text-xl shrink-0">
                💸
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white group-hover:text-indigo-400 transition-colors">
                  Instant Tipping
                </h3>
                <p className="text-sm text-gray-400 mt-1">
                  Send USDC tips to any X user with a single click using our Chrome extension.
                  Tips appear on every tweet automatically.
                </p>
              </div>
            </div>
          </Link>

          <Link href="/docs/claiming" className="block p-5 bg-gradient-to-r from-purple-500/5 to-transparent border border-white/5 hover:border-purple-500/30 rounded-xl transition-all group">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center text-xl shrink-0">
                🎁
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white group-hover:text-purple-400 transition-colors">
                  No Wallet Needed to Receive
                </h3>
                <p className="text-sm text-gray-400 mt-1">
                  Recipients don&apos;t need a wallet to get tipped. Just sign in with X to verify 
                  ownership and claim to any wallet later.
                </p>
              </div>
            </div>
          </Link>

          <Link href="/docs/extension" className="block p-5 bg-gradient-to-r from-cyan-500/5 to-transparent border border-white/5 hover:border-cyan-500/30 rounded-xl transition-all group">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-cyan-500/20 rounded-lg flex items-center justify-center text-xl shrink-0">
                🧩
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white group-hover:text-cyan-400 transition-colors">
                  Chrome Extension
                </h3>
                <p className="text-sm text-gray-400 mt-1">
                  Our browser extension adds a &quot;Tip&quot; button to every tweet on X, 
                  making tipping seamless and natural.
                </p>
              </div>
            </div>
          </Link>

          <Link href="/docs/contracts" className="block p-5 bg-gradient-to-r from-emerald-500/5 to-transparent border border-white/5 hover:border-emerald-500/30 rounded-xl transition-all group">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center text-xl shrink-0">
                📜
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white group-hover:text-emerald-400 transition-colors">
                  Verified Smart Contract
                </h3>
                <p className="text-sm text-gray-400 mt-1">
                  Fully verified on ArcScan. Non-custodial escrow ensures your tips are secure 
                  until claimed by the rightful owner.
                </p>
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* How it Works Overview */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">How It Works</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-white/[0.02] border border-white/5 rounded-xl text-center">
            <div className="text-3xl mb-3">1️⃣</div>
            <h4 className="text-white font-semibold mb-1">Install Extension</h4>
            <p className="text-xs text-gray-500">Add PayX to Chrome</p>
          </div>
          <div className="p-4 bg-white/[0.02] border border-white/5 rounded-xl text-center">
            <div className="text-3xl mb-3">2️⃣</div>
            <h4 className="text-white font-semibold mb-1">Send Tip</h4>
            <p className="text-xs text-gray-500">Click tip on any tweet</p>
          </div>
          <div className="p-4 bg-white/[0.02] border border-white/5 rounded-xl text-center">
            <div className="text-3xl mb-3">3️⃣</div>
            <h4 className="text-white font-semibold mb-1">Creator Notified</h4>
            <p className="text-xs text-gray-500">Tip held in escrow</p>
          </div>
          <div className="p-4 bg-white/[0.02] border border-white/5 rounded-xl text-center">
            <div className="text-3xl mb-3">4️⃣</div>
            <h4 className="text-white font-semibold mb-1">Claim Tips</h4>
            <p className="text-xs text-gray-500">Sign in with X to withdraw</p>
          </div>
        </div>
      </section>

      {/* Protocol Stats */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">Protocol Stats</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 bg-gradient-to-br from-indigo-500/10 to-indigo-600/5 border border-indigo-500/20 rounded-xl">
            <div className="text-2xl font-bold text-white">&lt;1s</div>
            <div className="text-sm text-gray-400">Finality</div>
          </div>
          <div className="p-4 bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20 rounded-xl">
            <div className="text-2xl font-bold text-white">1%</div>
            <div className="text-sm text-gray-400">Platform Fee</div>
          </div>
          <div className="p-4 bg-gradient-to-br from-cyan-500/10 to-cyan-600/5 border border-cyan-500/20 rounded-xl">
            <div className="text-2xl font-bold text-white">~$0.01</div>
            <div className="text-sm text-gray-400">Per TX</div>
          </div>
          <div className="p-4 bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border border-emerald-500/20 rounded-xl">
            <div className="text-2xl font-bold text-white">$0.10</div>
            <div className="text-sm text-gray-400">Min Tip</div>
          </div>
        </div>
      </section>

      {/* Get Started */}
      <section>
        <h2 className="text-2xl font-bold text-white mb-4">Get Started</h2>
        <div className="p-6 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-xl">
          <p className="text-gray-300 mb-4">
            Ready to start receiving tips? Follow our quick start guide to check your 
            pending tips and claim them in under 2 minutes.
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
