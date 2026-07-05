'use client'

export default function VaultPage() {
  return (
    <div className="prose prose-invert max-w-none">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-white mb-4">Vault</h1>
        <p className="text-xl text-gray-400">
          Deposit USDC into XyloNet's auto-compounding vault and earn yield passively through optimized DeFi strategies.
        </p>
      </div>

      {/* Vault Overview */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">Vault Overview</h2>
        <div className="bg-gradient-to-br from-[#0A786A]/10 to-[#01C38E]/10 border border-[#0A786A]/20 rounded-xl p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl bg-[#0A786A]/20 flex items-center justify-center">
                <img src="/tokens/usdc.svg" alt="USDC" className="w-10 h-10" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">XyloVault</h3>
                <p className="text-gray-400">USDC Yield Optimizer</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-6 text-center">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">APY</p>
                <p className="text-2xl font-bold text-green-400">~5.0%</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">Standard</p>
                <p className="text-2xl font-bold text-white">ERC-4626</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">Status</p>
                <p className="text-2xl font-bold text-green-400">Active</p>
              </div>
            </div>
          </div>

          <div className="bg-[#0f172a] rounded-lg p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-gray-400">Contract</p>
                <a href="https://testnet.arcscan.app/address/0x240Eb85458CD41361bd8C3773253a1D78054f747" target="_blank" rel="noopener" className="text-blue-400 font-mono text-xs hover:text-blue-300">
                  0x240E...747
                </a>
              </div>
              <div>
                <p className="text-gray-400">Deposit Token</p>
                <p className="text-white">USDC</p>
              </div>
              <div>
                <p className="text-gray-400">Share Token</p>
                <p className="text-white">xyUSDC</p>
              </div>
              <div>
                <p className="text-gray-400">Withdrawal</p>
                <p className="text-white">Instant</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">How the Vault Works</h2>
        <div className="space-y-6">
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">Deposit → Share Tokens → Yield</h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto mb-3">
                  <img src="/tokens/usdc.svg" alt="USDC" className="w-8 h-8" />
                </div>
                <h4 className="text-white font-semibold mb-1">1. Deposit USDC</h4>
                <p className="text-gray-400 text-sm">Deposit any amount of USDC into the vault</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-[#0A786A]/20 flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">🎫</span>
                </div>
                <h4 className="text-white font-semibold mb-1">2. Receive xyUSDC</h4>
                <p className="text-gray-400 text-sm">Get share tokens representing your deposit</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">📈</span>
                </div>
                <h4 className="text-white font-semibold mb-1">3. Earn Yield</h4>
                <p className="text-gray-400 text-sm">Watch your shares appreciate in value</p>
              </div>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">ERC-4626 Standard</h3>
            <p className="text-gray-300 mb-4">
              XyloVault implements the <strong className="text-white">ERC-4626</strong> tokenized vault standard, 
              ensuring compatibility with the broader DeFi ecosystem. This means:
            </p>
            <ul className="space-y-2 text-gray-300">
              <li className="flex items-start gap-2">
                <span className="text-green-400">✓</span>
                <span>Standardized deposit/withdraw interface</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400">✓</span>
                <span>Share tokens (xyUSDC) are fungible ERC-20 tokens</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400">✓</span>
                <span>Easy integration with other protocols</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400">✓</span>
                <span>Composable with lending, staking, and other DeFi primitives</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Yield Strategy */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">Yield Strategy</h2>
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <p className="text-gray-300 mb-6">
            The XyloVault generates yield through multiple strategies, primarily leveraging the USYC (US Yield Coin) 
            integration for real-world asset backed returns:
          </p>

          <div className="space-y-4">
            <div className="bg-gradient-to-r from-[#0A786A]/10 to-[#01C38E]/10 border border-[#0A786A]/20 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <img src="/tokens/usyc.png" alt="USYC" className="w-8 h-8" />
                <h4 className="text-white font-semibold">USYC Strategy (Primary)</h4>
              </div>
              <p className="text-gray-400 text-sm mb-3">
                USDC is converted to USYC (US Yield Coin by Hashnote), which is backed by short-term US Treasury bills. 
                This provides stable, real-world yield from government securities.
              </p>
              <div className="flex items-center gap-4 text-sm">
                <span className="text-gray-400">Current APY:</span>
                <span className="text-green-400 font-semibold">~4.5-5.0%</span>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-xl">🔄</span>
                <h4 className="text-white font-semibold">Auto-Compounding</h4>
              </div>
              <p className="text-gray-400 text-sm">
                Yield is automatically reinvested to compound returns. No manual harvesting required.
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-xl">📊</span>
                <h4 className="text-white font-semibold">LP Fee Sharing</h4>
              </div>
              <p className="text-gray-400 text-sm">
                A portion of vault assets is deployed to XyloNet's liquidity pools to earn additional trading fees.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How to Use */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">How to Deposit</h2>
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <ol className="space-y-6">
            <li className="flex gap-4">
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold">1</span>
              <div>
                <h4 className="text-white font-semibold mb-1">Connect Your Wallet</h4>
                <p className="text-gray-400 text-sm">Connect your wallet to XyloNet and ensure you have USDC on Arc Network.</p>
              </div>
            </li>
            <li className="flex gap-4">
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold">2</span>
              <div>
                <h4 className="text-white font-semibold mb-1">Navigate to Vault</h4>
                <p className="text-gray-400 text-sm">Go to the <a href="/vault" className="text-blue-400 hover:text-blue-300">Vault</a> page.</p>
              </div>
            </li>
            <li className="flex gap-4">
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold">3</span>
              <div>
                <h4 className="text-white font-semibold mb-1">Enter Amount</h4>
                <p className="text-gray-400 text-sm">Enter the amount of USDC you want to deposit. Preview shows expected xyUSDC shares.</p>
              </div>
            </li>
            <li className="flex gap-4">
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold">4</span>
              <div>
                <h4 className="text-white font-semibold mb-1">Approve USDC</h4>
                <p className="text-gray-400 text-sm">First time only: Approve the vault contract to spend your USDC.</p>
              </div>
            </li>
            <li className="flex gap-4">
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 font-bold">5</span>
              <div>
                <h4 className="text-white font-semibold mb-1">Deposit & Earn</h4>
                <p className="text-gray-400 text-sm">Confirm the transaction and start earning yield immediately!</p>
              </div>
            </li>
          </ol>
        </div>
      </section>

      {/* How to Withdraw */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">How to Withdraw</h2>
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <ol className="space-y-4 text-gray-300">
            <li className="flex items-start gap-3">
              <span className="text-blue-400 font-bold">1.</span>
              <span>Go to the Vault page and click "Withdraw"</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-blue-400 font-bold">2.</span>
              <span>Enter the amount of USDC to withdraw (or xyUSDC shares to redeem)</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-blue-400 font-bold">3.</span>
              <span>Confirm the transaction</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-blue-400 font-bold">4.</span>
              <span>Receive your USDC plus accrued yield</span>
            </li>
          </ol>

          <div className="mt-6 bg-green-500/10 border border-green-500/30 rounded-lg p-4">
            <p className="text-green-200 text-sm flex items-start gap-2">
              <span className="text-green-400">✓</span>
              <span><strong>No lock-up period:</strong> Withdraw your funds instantly at any time. No penalties or waiting periods.</span>
            </p>
          </div>
        </div>
      </section>

      {/* Share Token Mechanics */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">Share Token Mechanics</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">Exchange Rate</h3>
            <p className="text-gray-400 text-sm mb-4">
              The exchange rate between USDC and xyUSDC increases over time as yield accumulates:
            </p>
            <div className="bg-[#0f172a] rounded-lg p-4 font-mono text-sm">
              <p className="text-gray-400">// Exchange Rate Formula</p>
              <p className="text-blue-400">rate = totalAssets / totalSupply</p>
              <p className="text-gray-400 mt-2">// Example</p>
              <p className="text-green-400">1 xyUSDC = 1.05 USDC (after yield)</p>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">Minting & Burning</h3>
            <p className="text-gray-400 text-sm mb-4">
              xyUSDC tokens are minted on deposit and burned on withdrawal:
            </p>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between p-3 bg-green-500/10 rounded-lg">
                <span className="text-green-400">Deposit USDC</span>
                <span className="text-white">→ Mint xyUSDC</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-red-500/10 rounded-lg">
                <span className="text-red-400">Withdraw USDC</span>
                <span className="text-white">→ Burn xyUSDC</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Smart Contract */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">Smart Contract</h2>
        <div className="bg-[#0f172a] border border-white/10 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-white/10 bg-white/5">
            <h3 className="font-mono text-sm text-gray-400">XyloVault</h3>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Contract Address</p>
              <a 
                href="https://testnet.arcscan.app/address/0x240Eb85458CD41361bd8C3773253a1D78054f747" 
                target="_blank" 
                rel="noopener"
                className="text-blue-400 font-mono text-sm hover:text-blue-300 break-all"
              >
                0x240Eb85458CD41361bd8C3773253a1D78054f747
              </a>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Key Functions</p>
              <div className="space-y-2 font-mono text-sm">
                <div className="bg-white/5 rounded p-2">
                  <span className="text-[#0A786A]">deposit</span>
                  <span className="text-gray-400">(assets, receiver)</span>
                  <span className="text-gray-500"> → shares</span>
                </div>
                <div className="bg-white/5 rounded p-2">
                  <span className="text-[#0A786A]">withdraw</span>
                  <span className="text-gray-400">(assets, receiver, owner)</span>
                  <span className="text-gray-500"> → shares</span>
                </div>
                <div className="bg-white/5 rounded p-2">
                  <span className="text-[#0A786A]">redeem</span>
                  <span className="text-gray-400">(shares, receiver, owner)</span>
                  <span className="text-gray-500"> → assets</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section>
        <div className="bg-gradient-to-r from-[#0A786A]/20 to-[#01C38E]/20 border border-[#0A786A]/30 rounded-xl p-8 text-center">
          <h3 className="text-2xl font-bold text-white mb-4">Start Earning Yield</h3>
          <p className="text-gray-300 mb-6">Deposit USDC and let XyloVault grow your assets automatically.</p>
          <a 
            href="/vault" 
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#0A786A] to-[#01C38E] text-white font-semibold rounded-xl hover:opacity-90 transition-opacity"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Open Vault
          </a>
        </div>
      </section>
    </div>
  )
}
