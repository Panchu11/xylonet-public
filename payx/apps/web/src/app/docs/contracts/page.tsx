'use client';

export default function ContractsPage() {
  const contract = {
    name: 'PayXTipping',
    address: '0xA312c384770B7b49E371DF4b7AF730EFEF465913',
    description: 'Main tipping contract - handles tip escrow, claiming, and wallet linking',
    functions: [
      { name: 'tip', params: '(handle, amount, message)', desc: 'Send a tip to an X handle' },
      { name: 'claimTips', params: '(handle, wallet, nonce, signature)', desc: 'Claim pending tips with oracle signature' },
      { name: 'getPendingBalance', params: '(handle)', desc: 'Get pending balance for a handle' },
      { name: 'getHandleInfo', params: '(handle)', desc: 'Get full info for a handle' },
      { name: 'getTipHistory', params: '(handle, offset, limit)', desc: 'Get tip history for a handle' },
    ],
  };

  const tokens = [
    { 
      name: 'USDC', 
      symbol: 'USDC', 
      address: '0x3600000000000000000000000000000000000000', 
      decimals: 6, 
      logo: '/tokens/usdc.svg',
      description: 'Circle\'s official USD stablecoin - native gas token on Arc'
    },
  ];

  return (
    <div className="prose prose-invert max-w-none">
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-white mb-4">Smart Contract</h1>
        <p className="text-xl text-gray-400">
          PayX contract details, addresses, and technical specifications on Arc Testnet.
        </p>
      </div>

      {/* Network Info */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">Network Information</h2>
        <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-xl p-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                <img src="/chains/arc.png" alt="Arc" className="w-6 h-6" />
                Arc Testnet
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-gray-400">Chain ID:</span><span className="text-white font-mono">5042002</span></div>
                <div className="flex justify-between"><span className="text-gray-400">RPC URL:</span><span className="text-indigo-400 font-mono text-xs">rpc.testnet.arc.network</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Gas Token:</span><span className="text-white">USDC</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Finality:</span><span className="text-white">&lt;350ms</span></div>
              </div>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-3">Block Explorer</h3>
              <a href="https://testnet.arcscan.app" target="_blank" rel="noopener" className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-lg text-indigo-400 hover:bg-white/20 transition-colors">
                <span>testnet.arcscan.app</span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Main Contract */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">PayX Tipping Contract</h2>
        <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
          <div className="p-5 bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border-b border-white/10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                  <span className="text-xl">📜</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">{contract.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="px-2 py-0.5 text-xs bg-emerald-500/20 text-emerald-400 rounded-full">Verified</span>
                    <span className="px-2 py-0.5 text-xs bg-indigo-500/20 text-indigo-400 rounded-full">Active</span>
                  </div>
                </div>
              </div>
              <a 
                href={`https://testnet.arcscan.app/address/${contract.address}#code`} 
                target="_blank" 
                rel="noopener" 
                className="flex items-center gap-2 text-indigo-400 font-mono text-sm hover:text-indigo-300 transition-colors"
              >
                <span className="hidden sm:inline">{contract.address}</span>
                <span className="sm:hidden">{contract.address.slice(0, 10)}...{contract.address.slice(-8)}</span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
              </a>
            </div>
            <p className="text-gray-400 text-sm mt-3">{contract.description}</p>
          </div>
          
          <div className="p-5">
            <h4 className="text-xs text-gray-500 uppercase tracking-wider mb-4">Key Functions</h4>
            <div className="space-y-3">
              {contract.functions.map((fn) => (
                <div key={fn.name} className="p-3 bg-white/5 rounded-lg border border-white/5">
                  <div className="flex items-start justify-between gap-4">
                    <code className="text-purple-400 text-sm">
                      {fn.name}<span className="text-gray-500">{fn.params}</span>
                    </code>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{fn.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Constructor Parameters */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">Contract Configuration</h2>
        <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-white/5 border-b border-white/10">
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Parameter</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              <tr>
                <td className="px-4 py-3 text-gray-300">USDC Token</td>
                <td className="px-4 py-3">
                  <a href="https://testnet.arcscan.app/address/0x3600000000000000000000000000000000000000" target="_blank" rel="noopener" className="text-indigo-400 font-mono text-sm hover:text-indigo-300">
                    0x3600...0000
                  </a>
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-gray-300">Platform Fee</td>
                <td className="px-4 py-3 text-white font-mono">100 bps (1%)</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-gray-300">Minimum Tip</td>
                <td className="px-4 py-3 text-white font-mono">100000 (0.1 USDC)</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-gray-300">Oracle Signer</td>
                <td className="px-4 py-3">
                  <a href="https://testnet.arcscan.app/address/0x94e0dc7AD29b94EC9819f6cEC3364DD34f41b3c6" target="_blank" rel="noopener" className="text-indigo-400 font-mono text-sm hover:text-indigo-300">
                    0x94e0...b3c6
                  </a>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Token Contract */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">USDC Token</h2>
        <div className="bg-white/5 border border-white/10 rounded-xl p-5">
          <div className="flex items-start gap-4">
            <img src="/tokens/usdc.svg" alt="USDC" className="w-12 h-12" />
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-lg font-bold text-white">USDC</h3>
                <span className="px-2 py-0.5 text-xs bg-blue-500/20 text-blue-400 rounded-full">Native Gas</span>
              </div>
              <p className="text-gray-400 text-sm mb-3">Circle&apos;s official USD stablecoin. Native gas token on Arc Network.</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Address</span>
                  <a href="https://testnet.arcscan.app/address/0x3600000000000000000000000000000000000000" target="_blank" rel="noopener" className="block text-indigo-400 font-mono hover:text-indigo-300 truncate">
                    0x3600...0000
                  </a>
                </div>
                <div>
                  <span className="text-gray-500">Decimals</span>
                  <p className="text-white font-mono">6</p>
                </div>
                <div>
                  <span className="text-gray-500">Symbol</span>
                  <p className="text-white">USDC</p>
                </div>
                <div>
                  <span className="text-gray-500">Faucet</span>
                  <a href="https://faucet.circle.com" target="_blank" rel="noopener" className="block text-indigo-400 hover:text-indigo-300">
                    faucet.circle.com
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Events */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">Contract Events</h2>
        <div className="space-y-4">
          <div className="bg-white/5 border border-white/10 rounded-xl p-5">
            <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
              <span className="text-indigo-400">📤</span> TipSent
            </h4>
            <div className="bg-[#0a0b0f] rounded-lg p-4 font-mono text-xs overflow-x-auto">
              <pre className="text-gray-300">
{`event TipSent(
    string indexed handleHash,
    string handle,
    address indexed tipper,
    uint256 amount,
    uint256 fee,
    string message,
    uint256 timestamp
);`}
              </pre>
            </div>
          </div>
          
          <div className="bg-white/5 border border-white/10 rounded-xl p-5">
            <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
              <span className="text-emerald-400">📥</span> TipsClaimed
            </h4>
            <div className="bg-[#0a0b0f] rounded-lg p-4 font-mono text-xs overflow-x-auto">
              <pre className="text-gray-300">
{`event TipsClaimed(
    string indexed handleHash,
    string handle,
    address indexed wallet,
    uint256 amount,
    uint256 timestamp
);`}
              </pre>
            </div>
          </div>
          
          <div className="bg-white/5 border border-white/10 rounded-xl p-5">
            <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
              <span className="text-purple-400">🔗</span> WalletLinked
            </h4>
            <div className="bg-[#0a0b0f] rounded-lg p-4 font-mono text-xs overflow-x-auto">
              <pre className="text-gray-300">
{`event WalletLinked(
    string indexed handleHash,
    string handle,
    address indexed wallet
);`}
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* Verification */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">Contract Verification</h2>
        <div className="bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border border-emerald-500/20 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-emerald-500/20 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <h3 className="text-white font-semibold">Verified on ArcScan</h3>
              <p className="text-gray-400 text-sm">Source code is publicly viewable</p>
            </div>
          </div>
          <a 
            href="https://testnet.arcscan.app/address/0xA312c384770B7b49E371DF4b7AF730EFEF465913#code" 
            target="_blank" 
            rel="noopener" 
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-lg text-emerald-400 hover:bg-white/20 transition-colors"
          >
            View Verified Source Code
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
          </a>
        </div>
      </section>

      {/* Integration */}
      <section>
        <h2 className="text-2xl font-bold text-white mb-6">Integration</h2>
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <p className="text-gray-300 mb-4">
            Want to integrate PayX into your application? Here&apos;s a quick example:
          </p>
          <div className="bg-[#0a0b0f] rounded-lg p-4 font-mono text-sm overflow-x-auto">
            <pre className="text-gray-300">
{`import { createPublicClient, http } from 'viem';
import { arcTestnet } from 'viem/chains';

const client = createPublicClient({
  chain: arcTestnet,
  transport: http('https://rpc.testnet.arc.network'),
});

// Check pending balance for a handle
const balance = await client.readContract({
  address: '0xA312c384770B7b49E371DF4b7AF730EFEF465913',
  abi: PayXTippingABI,
  functionName: 'getPendingBalance',
  args: ['username'],
});`}
            </pre>
          </div>
        </div>
      </section>
    </div>
  );
}
