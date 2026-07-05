'use client'

export default function ContractsPage() {
  const contracts = [
    {
      name: 'XyloFactory',
      address: '0x60EDeFB094B84BBC6430cc130B358A43Ba1979e2',
      description: 'Factory contract for deploying new liquidity pools',
      functions: ['createPool', 'getPool', 'allPools', 'allPoolsLength'],
      status: 'active'
    },
    {
      name: 'XyloRouter',
      address: '0x73742278c31a76dBb0D2587d03ef92E6E2141023',
      description: 'Router for executing swaps through pools',
      functions: ['swap', 'getAmountOut', 'addLiquidity', 'removeLiquidity'],
      status: 'active'
    },
    {
      name: 'XyloBridge',
      address: '0xf7Df65Ce418E938ee8d9a0A0d227A43441fe4641',
      description: 'CCTP V2 bridge contract (Standard Transfer). Frontend uses Circle Bridge Kit directly for Fast Transfer (~30 sec).',
      functions: ['bridgeOut', 'bridgeIn', 'bridgeToChain', 'getStats'],
      status: 'deployed',
      note: 'Not used by frontend'
    },
    {
      name: 'XyloVault',
      address: '0x240Eb85458CD41361bd8C3773253a1D78054f747',
      description: 'ERC-4626 vault for USDC yield generation',
      functions: ['deposit', 'withdraw', 'redeem', 'totalAssets'],
      status: 'active'
    },
    {
      name: 'USDC-EURC Pool',
      address: '0x3DF3966F5138143dce7a9cFDdC2c0310ce083BB1',
      description: 'StableSwap pool for USDC/EURC trading',
      functions: ['swap', 'addLiquidity', 'removeLiquidity', 'getReserves'],
      status: 'active'
    },
    {
      name: 'USDC-USYC Pool',
      address: '0x8296cC7477A9CD12cF632042fDDc2aB89151bb61',
      description: 'StableSwap pool for USDC/USYC trading',
      functions: ['swap', 'addLiquidity', 'removeLiquidity', 'getReserves'],
      status: 'active'
    }
  ]

  const tokens = [
    { name: 'USDC', symbol: 'USDC', address: '0x3600000000000000000000000000000000000000', decimals: 6, logo: '/tokens/usdc.svg' },
    { name: 'EURC', symbol: 'EURC', address: '0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a', decimals: 6, logo: '/tokens/eurc.png' },
    { name: 'USYC', symbol: 'USYC', address: '0xe9185F0c5F296Ed1797AaE4238D26CCaBEadb86C', decimals: 6, logo: '/tokens/usyc.png' }
  ]

  const circleContracts = [
    { name: 'Token Messenger', address: '0x8FE6B999Dc680CcFDD5Bf7EB0974218be2542DAA', description: 'Handles CCTP burn/mint operations' },
    { name: 'Message Transmitter', address: '0xE737e5cEBEEBa77EFE34D4aa090756590b1CE275', description: 'Cross-chain message relay' }
  ]

  return (
    <div className="prose prose-invert max-w-none">
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-white mb-4">Smart Contracts</h1>
        <p className="text-xl text-gray-400">
          All XyloNet smart contracts deployed on Arc Testnet with addresses and key functions.
        </p>
      </div>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">Network Information</h2>
        <div className="bg-gradient-to-br from-[#0A786A]/10 to-[#01C38E]/10 border border-[#0A786A]/20 rounded-xl p-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                <img src="/chains/arc.png" alt="Arc" className="w-6 h-6" />
                Arc Testnet
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-gray-400">Chain ID:</span><span className="text-white font-mono">5042002</span></div>
                <div className="flex justify-between"><span className="text-gray-400">RPC URL:</span><span className="text-blue-400 font-mono text-xs">rpc.testnet.arc.network</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Gas Token:</span><span className="text-white">USDC</span></div>
              </div>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-3">Block Explorer</h3>
              <a href="https://testnet.arcscan.app" target="_blank" rel="noopener" className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-lg text-blue-400 hover:bg-white/20 transition-colors">
                <span>testnet.arcscan.app</span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">XyloNet Contracts</h2>
        <div className="space-y-4">
          {contracts.map((contract) => (
            <div key={contract.address} className={`bg-white/5 border rounded-xl overflow-hidden ${contract.status === 'deployed' ? 'border-yellow-500/30' : 'border-white/10'}`}>
              <div className="p-4 bg-white/5 border-b border-white/10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-white">{contract.name}</h3>
                    {contract.note && (
                      <span className="px-2 py-0.5 text-xs bg-yellow-500/20 text-yellow-400 rounded-full">{contract.note}</span>
                    )}
                  </div>
                  <a href={`https://testnet.arcscan.app/address/${contract.address}`} target="_blank" rel="noopener" className="text-blue-400 font-mono text-sm hover:text-blue-300 flex items-center gap-1">
                    {contract.address.slice(0, 6)}...{contract.address.slice(-4)}
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                  </a>
                </div>
                <p className={`text-sm mt-1 ${contract.status === 'deployed' ? 'text-yellow-200/70' : 'text-gray-400'}`}>{contract.description}</p>
              </div>
              <div className="p-4">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Key Functions</p>
                <div className="flex flex-wrap gap-2">
                  {contract.functions.map((fn) => (
                    <span key={fn} className="px-2 py-1 bg-[#0A786A]/20 text-[#0A786A] rounded text-xs font-mono">{fn}()</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">Token Contracts</h2>
        <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-white/5 border-b border-white/10">
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Token</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Address</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Decimals</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {tokens.map((token) => (
                <tr key={token.address}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <img src={token.logo} alt={token.symbol} className="w-6 h-6" />
                      <div>
                        <p className="text-white font-medium">{token.symbol}</p>
                        <p className="text-gray-500 text-xs">{token.name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <a href={`https://testnet.arcscan.app/address/${token.address}`} target="_blank" rel="noopener" className="text-blue-400 font-mono text-sm hover:text-blue-300">
                      {token.address.slice(0, 10)}...{token.address.slice(-8)}
                    </a>
                  </td>
                  <td className="px-4 py-3 text-white font-mono">{token.decimals}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">Circle CCTP Contracts</h2>
        <div className="space-y-4">
          {circleContracts.map((contract) => (
            <div key={contract.address} className="bg-white/5 border border-white/10 rounded-xl p-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                <div>
                  <h3 className="text-white font-semibold">{contract.name}</h3>
                  <p className="text-gray-400 text-sm">{contract.description}</p>
                </div>
                <a href={`https://testnet.arcscan.app/address/${contract.address}`} target="_blank" rel="noopener" className="text-blue-400 font-mono text-sm hover:text-blue-300">
                  {contract.address.slice(0, 10)}...{contract.address.slice(-8)}
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">Contract Verification</h2>
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <p className="text-gray-300 mb-4">All XyloNet contracts are verified on Arcscan. You can view and interact with the contract source code directly:</p>
          <ol className="space-y-3 text-gray-300">
            <li className="flex items-start gap-3"><span className="text-blue-400 font-bold">1.</span><span>Go to <a href="https://testnet.arcscan.app" target="_blank" rel="noopener" className="text-blue-400 hover:text-blue-300">testnet.arcscan.app</a></span></li>
            <li className="flex items-start gap-3"><span className="text-blue-400 font-bold">2.</span><span>Enter the contract address in the search bar</span></li>
            <li className="flex items-start gap-3"><span className="text-blue-400 font-bold">3.</span><span>Click the "Contract" tab to view verified source code</span></li>
            <li className="flex items-start gap-3"><span className="text-blue-400 font-bold">4.</span><span>Use "Read Contract" and "Write Contract" to interact</span></li>
          </ol>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-white mb-6">ABI Reference</h2>
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <p className="text-gray-300 mb-4">Contract ABIs are available in the project repository and on Arcscan. Key interfaces:</p>
          <div className="grid md:grid-cols-2 gap-4">
            <a href="/docs/integration" className="p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
              <h4 className="text-white font-semibold mb-1">Integration Guide</h4>
              <p className="text-gray-400 text-sm">Learn how to integrate with XyloNet contracts</p>
            </a>
            <div className="p-4 bg-white/5 rounded-lg opacity-60 cursor-not-allowed">
              <h4 className="text-white font-semibold mb-1">GitHub Repository</h4>
              <p className="text-gray-400 text-sm">Coming Soon</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
