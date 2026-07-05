'use client'

export default function BridgePage() {
  return (
    <div className="prose prose-invert max-w-none">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-white mb-4">Bridge</h1>
        <p className="text-xl text-gray-400">
          Bridge native USDC from Arc Network to 20+ blockchains using Circle App Kit with CCTP V2 and single-sign forwarding.
        </p>
      </div>

      {/* What is CCTP */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">What is CCTP?</h2>
        <div className="bg-gradient-to-br from-[#0A786A]/10 to-[#01C38E]/10 border border-[#0A786A]/20 rounded-xl p-6">
          <p className="text-gray-300 mb-4">
            <strong className="text-white">Cross-Chain Transfer Protocol (CCTP)</strong> is Circle's official protocol 
            for transferring native USDC between blockchains. Unlike traditional bridges that use wrapped tokens, 
            CCTP burns USDC on the source chain and mints native USDC on the destination chain.
          </p>
          <div className="grid md:grid-cols-3 gap-4 mt-6">
            <div className="bg-white/5 rounded-lg p-4">
              <div className="text-3xl mb-2">🔥</div>
              <h4 className="text-white font-semibold mb-1">Burn & Mint</h4>
              <p className="text-gray-400 text-sm">No wrapped tokens. Real USDC on every chain.</p>
            </div>
            <div className="bg-white/5 rounded-lg p-4">
              <div className="text-3xl mb-2">🔒</div>
              <h4 className="text-white font-semibold mb-1">Circle Secured</h4>
              <p className="text-gray-400 text-sm">Backed by Circle's attestation service.</p>
            </div>
            <div className="bg-white/5 rounded-lg p-4">
              <div className="text-3xl mb-2">⚡</div>
              <h4 className="text-white font-semibold mb-1">Single-Sign</h4>
              <p className="text-gray-400 text-sm">Sign once — Circle&apos;s Orbit relayer delivers USDC automatically.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Supported Chains */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">Supported Chains</h2>
        <p className="text-gray-300 mb-6">
          Bridge USDC to and from Arc Network via any of 20 supported testnet chains:
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[
            { name: 'Arc Testnet', domain: 26, logo: '/chains/arc.png', chainId: 5042002 },
            { name: 'Ethereum Sepolia', domain: 0, logo: '/chains/ethereum.svg', chainId: 11155111 },
            { name: 'Arbitrum Sepolia', domain: 3, logo: '/chains/arbitrum.svg', chainId: 421614 },
            { name: 'Base Sepolia', domain: 6, logo: '/chains/base.jpg', chainId: 84532 },
            { name: 'Optimism Sepolia', domain: 2, logo: '/chains/optimism.svg', chainId: 11155420 },
            { name: 'Polygon Amoy', domain: 7, logo: '/chains/polygon.svg', chainId: 80002 },
            { name: 'Avalanche Fuji', domain: 1, logo: '/chains/avalanche.svg', chainId: 43113 },
            { name: 'Linea Sepolia', domain: null, logo: '/chains/linea.png', chainId: 59141 },
            { name: 'Sonic Testnet', domain: null, logo: '/chains/sonic.png', chainId: 14601 },
            { name: 'Unichain Sepolia', domain: null, logo: '/chains/unichain.png', chainId: 1301 },
            { name: 'World Chain Sepolia', domain: null, logo: '/chains/worldchain.png', chainId: 4801 },
            { name: 'HyperEVM Testnet', domain: null, logo: '/chains/hyperevm.png', chainId: 998 },
            { name: 'Ink Sepolia', domain: null, logo: '/chains/ink.png', chainId: 763373 },
            { name: 'Plume Testnet', domain: null, logo: '/chains/plume.png', chainId: 98867 },
            { name: 'Sei Testnet', domain: null, logo: '/chains/sei.png', chainId: 1328 },
            { name: 'Codex Testnet', domain: null, logo: '/chains/codex.png', chainId: 812242 },
            { name: 'XDC Apothem', domain: null, logo: '/chains/xdc.png', chainId: 51 },
            { name: 'Monad Testnet', domain: null, logo: '/chains/monad.svg', chainId: 10143 },
            { name: 'Morph Testnet', domain: 30, logo: '/chains/morph.jpg', chainId: 2810 },
            { name: 'Edge Testnet', domain: null, logo: '/chains/edgeX.jpg', chainId: 202402181627 },
          ].map((chain) => (
            <div key={chain.name} className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-colors">
              <div className="flex items-center gap-3">
                <img src={chain.logo} alt={chain.name} className="w-10 h-10 rounded-full" />
                <div>
                  <p className="text-white font-semibold">{chain.name}</p>
                  <p className="text-xs text-gray-500">Chain ID: {chain.chainId}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How to Bridge */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">How to Bridge</h2>
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <ol className="space-y-6">
            <li className="flex gap-4">
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold">1</span>
              <div>
                <h4 className="text-white font-semibold mb-1">Connect Your Wallet</h4>
                <p className="text-gray-400 text-sm">Connect your wallet on Arc Network where you have USDC.</p>
              </div>
            </li>
            <li className="flex gap-4">
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold">2</span>
              <div>
                <h4 className="text-white font-semibold mb-1">Select Destination Chain</h4>
                <p className="text-gray-400 text-sm">Choose where you want to send your USDC (e.g., Ethereum Sepolia).</p>
              </div>
            </li>
            <li className="flex gap-4">
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold">3</span>
              <div>
                <h4 className="text-white font-semibold mb-1">Enter Amount</h4>
                <p className="text-gray-400 text-sm">Enter the amount of USDC you want to bridge.</p>
              </div>
            </li>
            <li className="flex gap-4">
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-[#0A786A]/20 flex items-center justify-center text-[#0A786A] font-bold">4</span>
              <div>
                <h4 className="text-white font-semibold mb-1">Click Bridge</h4>
                <p className="text-gray-400 text-sm">Confirm the transaction. Circle App Kit handles everything — with forwarding enabled, you only sign once and Circle delivers USDC automatically.</p>
              </div>
            </li>
            <li className="flex gap-4">
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 font-bold">✓</span>
              <div>
                <h4 className="text-white font-semibold mb-1">Receive USDC (~30 seconds)</h4>
                <p className="text-gray-400 text-sm">Native USDC is automatically delivered to your wallet on the destination chain.</p>
              </div>
            </li>
          </ol>
        </div>
      </section>

      {/* Bridge Flow Diagram */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">Bridge Flow</h2>
        <div className="bg-[#0a0a0f] border border-white/10 rounded-xl p-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto mb-2">
                <img src="/chains/arc.png" alt="Arc" className="w-8 h-8" />
              </div>
              <p className="text-white font-semibold">Arc Network</p>
              <p className="text-xs text-gray-500">Burn USDC</p>
            </div>
            <div className="hidden md:block flex-1 h-0.5 bg-gradient-to-r from-[#0A786A] via-[#01C38E] to-green-500" />
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-[#0A786A]/20 flex items-center justify-center mx-auto mb-2">
                <span className="text-2xl">🔐</span>
              </div>
              <p className="text-white font-semibold">Circle CCTP</p>
              <p className="text-xs text-gray-500">Fast Attestation</p>
            </div>
            <div className="hidden md:block flex-1 h-0.5 bg-gradient-to-r from-[#0A786A] to-green-500" />
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-2">
                <img src="/chains/ethereum.svg" alt="Destination" className="w-8 h-8" />
              </div>
              <p className="text-white font-semibold">Destination</p>
              <p className="text-xs text-gray-500">Mint USDC</p>
            </div>
          </div>
        </div>
      </section>

      {/* Bridge Times */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">Transfer Modes</h2>
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-green-500/10 to-cyan-500/10 border border-green-500/30 rounded-lg p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                  <span className="text-xl">⚡</span>
                </div>
                <div>
                  <h4 className="text-green-400 font-bold">Fast Transfer</h4>
                  <p className="text-xs text-gray-400">Currently Active</p>
                </div>
              </div>
              <p className="text-gray-300 text-sm mb-3">XyloNet uses Circle App Kit with single-sign forwarding — Circle&apos;s Orbit relayer handles the mint on the destination chain.</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-gray-400">Transfer Time:</span><span className="text-green-400 font-semibold">~30 seconds</span></div>
                <div className="flex justify-between"><span className="text-gray-400">User Signatures:</span><span className="text-white">1 (Single-Sign)</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Dest. Gas Needed:</span><span className="text-white">No (Circle pays)</span></div>
              </div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-lg p-5 opacity-60">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-gray-500/20 flex items-center justify-center">
                  <span className="text-xl">⏳</span>
                </div>
                <div>
                  <h4 className="text-gray-400 font-bold">Standard Transfer</h4>
                  <p className="text-xs text-gray-500">Not Used</p>
                </div>
              </div>
              <p className="text-gray-500 text-sm mb-3">Waits for full source chain finality before attestation.</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">Transfer Time:</span><span className="text-gray-500">~15-19 minutes</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Use Case:</span><span className="text-gray-500">High-value transfers</span></div>
              </div>
            </div>
          </div>
          <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <p className="text-blue-200 text-sm">
              <strong>ℹ️</strong> Fast Transfer uses Circle's over-collateralization pool to provide faster-than-finality settlement while maintaining full security guarantees.
            </p>
          </div>
        </div>
      </section>

      {/* Implementation Note */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">Technical Implementation</h2>
        <div className="bg-gradient-to-br from-[#0A786A]/10 to-[#01C38E]/10 border border-[#0A786A]/20 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-[#0A786A]/20 flex items-center justify-center flex-shrink-0">
              <span className="text-2xl">⚡</span>
            </div>
            <div>
              <h3 className="text-white font-bold mb-2">Why We Use Circle App Kit</h3>
              <p className="text-gray-300 text-sm mb-4">
                For the best user experience, XyloNet's frontend uses <strong className="text-white">Circle App Kit</strong> with 
                <strong className="text-green-400"> single-sign forwarding</strong>. Users sign once — Circle's Orbit relayer 
                handles attestation and minting on the destination chain automatically. No gas needed on destination.
              </p>
              <div className="bg-white/5 rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-green-400">✓</span>
                  <span className="text-gray-300 text-sm"><strong className="text-white">Circle App Kit</strong> - Single-sign bridge across 20 chains with forwarding service</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-green-400">✓</span>
                  <span className="text-gray-300 text-sm"><strong className="text-white">Forwarding Service</strong> - Circle&apos;s Orbit relayer mints USDC on destination (no user gas needed)</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-gray-500">•</span>
                  <span className="text-gray-400 text-sm"><strong className="text-gray-300">XyloBridge Contract</strong> - Deployed on-chain but not used by frontend</span>
                </div>
              </div>
              <p className="text-gray-400 text-sm mt-4">
                The XyloBridge contract remains available for developers who want programmatic access or prefer Standard Transfer for high-value transactions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Smart Contract */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">Smart Contract</h2>
        <div className="bg-[#0a0a0f] border border-white/10 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-white/10 bg-white/5">
            <h3 className="font-mono text-sm text-gray-400">XyloBridge</h3>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Contract Address</p>
              <a 
                href="https://testnet.arcscan.app/address/0xf7Df65Ce418E938ee8d9a0A0d227A43441fe4641" 
                target="_blank" 
                rel="noopener"
                className="text-blue-400 font-mono text-sm hover:text-blue-300 break-all"
              >
                0xf7Df65Ce418E938ee8d9a0A0d227A43441fe4641
              </a>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Circle Token Messenger</p>
              <span className="text-blue-400 font-mono text-sm break-all">
                0x8FE6B999Dc680CcFDD5Bf7EB0974218be2542DAA
              </span>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Circle Message Transmitter</p>
              <span className="text-blue-400 font-mono text-sm break-all">
                0xE737e5cEBEEBa77EFE34D4aa090756590b1CE275
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Fees */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">Fees</h2>
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <h4 className="text-white font-semibold mb-2">Bridge Fee</h4>
              <p className="text-3xl font-bold text-green-400">0%</p>
              <p className="text-gray-400 text-sm mt-2">XyloNet doesn't charge any bridge fees.</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-2">Gas (Source Chain)</h4>
              <p className="text-gray-300">Variable</p>
              <p className="text-gray-400 text-sm mt-2">Standard gas fees apply on the source chain.</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-2">Gas (Arc Network)</h4>
              <p className="text-gray-300">~$0.001</p>
              <p className="text-gray-400 text-sm mt-2">Minimal fees on Arc Network.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section>
        <div className="bg-gradient-to-r from-[#0A786A]/20 to-[#01C38E]/20 border border-[#0A786A]/30 rounded-xl p-8 text-center">
          <h3 className="text-2xl font-bold text-white mb-4">Ready to Bridge?</h3>
          <p className="text-gray-300 mb-6">Transfer USDC from any of 20+ chains to Arc Network in seconds.</p>
          <a 
            href="/bridge" 
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#0A786A] to-[#01C38E] text-white font-semibold rounded-xl hover:opacity-90 transition-opacity"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            Launch Bridge
          </a>
        </div>
      </section>
    </div>
  )
}