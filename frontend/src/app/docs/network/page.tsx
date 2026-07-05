'use client'

export default function NetworkPage() {
  return (
    <div className="prose prose-invert max-w-none">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-white mb-4">Arc Network</h1>
        <p className="text-xl text-gray-400">
          XyloNet is built on Arc Network — a next-generation blockchain designed for stablecoins with native USDC as gas.
        </p>
      </div>

      {/* Arc Overview */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
          <img src="/chains/arc.png" alt="Arc" className="w-8 h-8" />
          What is Arc Network?
        </h2>
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <p className="text-gray-300 mb-4">
            Arc is a stablecoin-native Layer 1 blockchain built for the next generation of financial applications. 
            Unlike traditional blockchains that require native tokens for gas, Arc uses <strong className="text-white">USDC as its native gas token</strong>.
          </p>
          <p className="text-gray-300">
            This revolutionary approach eliminates the need for users to acquire separate gas tokens, making DeFi 
            accessible to mainstream users who only hold stablecoins.
          </p>
        </div>
      </section>

      {/* Key Features */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">Key Features</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-[#0A786A]/10 to-[#01C38E]/5 border border-[#0A786A]/20 rounded-xl p-6">
            <div className="w-12 h-12 rounded-xl bg-[#0A786A]/20 flex items-center justify-center mb-4">
              <img src="/tokens/usdc.svg" alt="USDC" className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">USDC as Gas</h3>
            <p className="text-gray-400 text-sm">
              Pay for all transactions with USDC. No need to acquire ETH, MATIC, or any other native token. 
              If you have USDC, you can use Arc.
            </p>
          </div>

          <div className="bg-gradient-to-br from-[#0A786A]/10 to-[#0A786A]/5 border border-[#0A786A]/20 rounded-xl p-6">
            <div className="w-12 h-12 rounded-xl bg-[#0A786A]/20 flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-[#0A786A]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Lightning Fast</h3>
            <p className="text-gray-400 text-sm">
              Sub-second block times with instant finality. Your transactions are confirmed in milliseconds, 
              not minutes.
            </p>
          </div>

          <div className="bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/20 rounded-xl p-6">
            <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Low Fees</h3>
            <p className="text-gray-400 text-sm">
              Transaction fees are a fraction of a cent, making even small transactions economically viable. 
              Perfect for stablecoin payments.
            </p>
          </div>

          <div className="bg-gradient-to-br from-cyan-500/10 to-cyan-600/5 border border-cyan-500/20 rounded-xl p-6">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Circle Backed</h3>
            <p className="text-gray-400 text-sm">
              Native CCTP V2 integration enables trustless USDC bridging between Arc and all major blockchains.
            </p>
          </div>
        </div>
      </section>

      {/* Network Configuration */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">Network Configuration</h2>
        <div className="bg-[#0a0a0f] border border-white/10 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-white/10 bg-white/5">
            <h3 className="font-mono text-sm text-gray-400">Arc Testnet Configuration</h3>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Network Name</p>
                <p className="text-white font-mono">Arc Testnet</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Chain ID</p>
                <p className="text-white font-mono">5042002</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">RPC URL</p>
                <p className="text-blue-400 font-mono text-sm break-all">https://rpc.testnet.arc.network</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">WebSocket URL</p>
                <p className="text-blue-400 font-mono text-sm break-all">wss://rpc.testnet.arc.network</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Currency Symbol</p>
                <p className="text-white font-mono">USDC</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Block Explorer</p>
                <a href="https://testnet.arcscan.app" target="_blank" rel="noopener" className="text-blue-400 font-mono text-sm hover:text-blue-300">
                  https://testnet.arcscan.app
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Add Network Button */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">Add Arc to Your Wallet</h2>
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <p className="text-gray-300 mb-6">
            Click the button below to automatically add Arc Testnet to your MetaMask wallet:
          </p>
          <button 
            onClick={() => {
              if (typeof window !== 'undefined' && window.ethereum) {
                window.ethereum.request({
                  method: 'wallet_addEthereumChain',
                  params: [{
                    chainId: '0x4CF212',
                    chainName: 'Arc Testnet',
                    nativeCurrency: {
                      name: 'USD Coin',
                      symbol: 'USDC',
                      decimals: 6
                    },
                    rpcUrls: ['https://rpc.testnet.arc.network'],
                    blockExplorerUrls: ['https://testnet.arcscan.app']
                  }]
                })
              }
            }}
            className="px-6 py-3 bg-gradient-to-r from-[#0A786A] to-[#01C38E] text-white font-semibold rounded-xl hover:opacity-90 transition-opacity flex items-center gap-2"
          >
            <img src="/chains/arc.png" alt="Arc" className="w-5 h-5" />
            Add Arc Testnet
          </button>

          <div className="mt-6 bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
            <p className="text-yellow-200 text-sm flex items-start gap-2">
              <span className="text-yellow-400">💡</span>
              <span>If the button doesn't work, you can manually add the network using the configuration details above.</span>
            </p>
          </div>
        </div>
      </section>

      {/* CCTP Domains */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">Supported CCTP Chains</h2>
        <p className="text-gray-300 mb-6">
          Arc is connected to all major blockchains via Circle's Cross-Chain Transfer Protocol (CCTP).
          Bridge native USDC to and from any of these networks:
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[
            { name: 'Ethereum', domain: 0, logo: '/chains/ethereum.svg' },
            { name: 'Arbitrum', domain: 3, logo: '/chains/arbitrum.svg' },
            { name: 'Base', domain: 6, logo: '/chains/base.jpg' },
            { name: 'Optimism', domain: 2, logo: '/chains/optimism.svg' },
            { name: 'Polygon', domain: 7, logo: '/chains/polygon.svg' },
            { name: 'Arc Testnet', domain: 26, logo: '/chains/arc.png' },
          ].map((chain) => (
            <div key={chain.name} className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center gap-3">
              <img src={chain.logo} alt={chain.name} className="w-8 h-8 rounded-full" />
              <div>
                <p className="text-white font-medium">{chain.name}</p>
                <p className="text-xs text-gray-500">Domain: {chain.domain}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Native Tokens on Arc */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">Native Stablecoins on Arc</h2>
        <div className="space-y-4">
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <div className="flex items-center gap-4 mb-4">
              <img src="/tokens/usdc.svg" alt="USDC" className="w-12 h-12" />
              <div>
                <h3 className="text-xl font-bold text-white">USDC</h3>
                <p className="text-gray-400 text-sm">Native USD Coin by Circle</p>
              </div>
            </div>
            <div className="bg-[#0a0a0f] rounded-lg p-3 font-mono text-sm">
              <span className="text-gray-500">Address: </span>
              <span className="text-blue-400">0x3600000000000000000000000000000000000000</span>
            </div>
            <p className="text-gray-400 text-sm mt-3">
              Native USDC is the gas token on Arc. It's bridged via CCTP and is 1:1 backed by Circle's reserves.
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <div className="flex items-center gap-4 mb-4">
              <img src="/tokens/eurc.png" alt="EURC" className="w-12 h-12" />
              <div>
                <h3 className="text-xl font-bold text-white">EURC</h3>
                <p className="text-gray-400 text-sm">Euro Coin by Circle</p>
              </div>
            </div>
            <div className="bg-[#0a0a0f] rounded-lg p-3 font-mono text-sm">
              <span className="text-gray-500">Address: </span>
              <span className="text-blue-400">0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a</span>
            </div>
            <p className="text-gray-400 text-sm mt-3">
              Euro-denominated stablecoin by Circle, enabling EUR/USD forex swaps on-chain.
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <div className="flex items-center gap-4 mb-4">
              <img src="/tokens/usyc.png" alt="USYC" className="w-12 h-12" />
              <div>
                <h3 className="text-xl font-bold text-white">USYC</h3>
                <p className="text-gray-400 text-sm">US Yield Coin by Hashnote</p>
              </div>
            </div>
            <div className="bg-[#0a0a0f] rounded-lg p-3 font-mono text-sm">
              <span className="text-gray-500">Address: </span>
              <span className="text-blue-400">0xe9185F0c5F296Ed1797AaE4238D26CCaBEadb86C</span>
            </div>
            <p className="text-gray-400 text-sm mt-3">
              Yield-bearing stablecoin backed by US Treasury bills, providing real-world yield on-chain.
            </p>
          </div>
        </div>
      </section>

      {/* Resources */}
      <section>
        <h2 className="text-2xl font-bold text-white mb-6">Resources</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <a href="https://www.arc.network" target="_blank" rel="noopener" className="bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-colors">
            <h3 className="text-lg font-bold text-white mb-2">Arc Official Website</h3>
            <p className="text-gray-400 text-sm">Learn more about Arc Network and its vision.</p>
          </a>
          <a href="https://testnet.arcscan.app" target="_blank" rel="noopener" className="bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-colors">
            <h3 className="text-lg font-bold text-white mb-2">Block Explorer</h3>
            <p className="text-gray-400 text-sm">View transactions, contracts, and network activity.</p>
          </a>
          <a href="https://faucet.circle.com" target="_blank" rel="noopener" className="bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-colors">
            <h3 className="text-lg font-bold text-white mb-2">USDC Faucet</h3>
            <p className="text-gray-400 text-sm">Get testnet USDC for development and testing.</p>
          </a>
          <a href="https://docs.arc.network" target="_blank" rel="noopener" className="bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-colors">
            <h3 className="text-lg font-bold text-white mb-2">Arc Documentation</h3>
            <p className="text-gray-400 text-sm">Technical documentation for developers.</p>
          </a>
        </div>
      </section>
    </div>
  )
}
