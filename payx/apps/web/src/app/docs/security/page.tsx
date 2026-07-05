'use client';

export default function SecurityPage() {
  return (
    <div className="prose prose-invert max-w-none">
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-white mb-4">Security</h1>
        <p className="text-xl text-gray-400">
          PayX&apos;s security practices, smart contract safety, and risk considerations.
        </p>
      </div>

      {/* Overview */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">Security Overview</h2>
        <div className="bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 border border-emerald-500/20 rounded-xl p-6">
          <p className="text-gray-300 mb-6">
            PayX is designed with security as a top priority. Our non-custodial architecture ensures 
            you always maintain control of your funds.
          </p>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-white/5 rounded-lg p-4 text-center">
              <div className="text-3xl mb-2">🔒</div>
              <h4 className="text-white font-semibold">Non-Custodial</h4>
              <p className="text-gray-400 text-sm">You always control your funds</p>
            </div>
            <div className="bg-white/5 rounded-lg p-4 text-center">
              <div className="text-3xl mb-2">✅</div>
              <h4 className="text-white font-semibold">Verified</h4>
              <p className="text-gray-400 text-sm">Contract verified on ArcScan</p>
            </div>
            <div className="bg-white/5 rounded-lg p-4 text-center">
              <div className="text-3xl mb-2">🛡️</div>
              <h4 className="text-white font-semibold">Battle-Tested</h4>
              <p className="text-gray-400 text-sm">Built on proven libraries</p>
            </div>
          </div>
        </div>
      </section>

      {/* Smart Contract Security */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">Smart Contract Security</h2>
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <h3 className="text-lg font-bold text-white mb-4">Security Measures</h3>
          <ul className="space-y-4">
            <li className="flex items-start gap-3">
              <span className="text-emerald-400 mt-1">✓</span>
              <div>
                <strong className="text-white">Reentrancy Protection</strong>
                <p className="text-gray-400 text-sm mt-1">Uses OpenZeppelin&apos;s ReentrancyGuard to prevent recursive attacks</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-emerald-400 mt-1">✓</span>
              <div>
                <strong className="text-white">SafeERC20</strong>
                <p className="text-gray-400 text-sm mt-1">Safe token transfers using OpenZeppelin&apos;s SafeERC20 library</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-emerald-400 mt-1">✓</span>
              <div>
                <strong className="text-white">Integer Overflow Protection</strong>
                <p className="text-gray-400 text-sm mt-1">Solidity 0.8.24 with built-in overflow checks</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-emerald-400 mt-1">✓</span>
              <div>
                <strong className="text-white">Access Control</strong>
                <p className="text-gray-400 text-sm mt-1">Ownable pattern for administrative functions</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-emerald-400 mt-1">✓</span>
              <div>
                <strong className="text-white">Input Validation</strong>
                <p className="text-gray-400 text-sm mt-1">All inputs validated with custom errors for clear feedback</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-emerald-400 mt-1">✓</span>
              <div>
                <strong className="text-white">Replay Protection</strong>
                <p className="text-gray-400 text-sm mt-1">Unique nonces prevent signature replay attacks on claims</p>
              </div>
            </li>
          </ul>
        </div>
      </section>

      {/* Claim Security */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">Claim Security</h2>
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <p className="text-gray-300 mb-4">
            The claim process uses a secure two-factor verification:
          </p>
          <div className="space-y-4">
            <div className="p-4 bg-white/5 rounded-lg border border-white/10">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-xl">1️⃣</span>
                <h4 className="text-white font-semibold">X OAuth Verification</h4>
              </div>
              <p className="text-sm text-gray-400">
                Users must authenticate via X OAuth to prove they own the handle. 
                We only request read access to the profile.
              </p>
            </div>
            <div className="p-4 bg-white/5 rounded-lg border border-white/10">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-xl">2️⃣</span>
                <h4 className="text-white font-semibold">Oracle Signature</h4>
              </div>
              <p className="text-sm text-gray-400">
                Our backend oracle signs a message containing the handle, wallet, and nonce.
                The contract verifies this signature before releasing funds.
              </p>
            </div>
            <div className="p-4 bg-white/5 rounded-lg border border-white/10">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-xl">3️⃣</span>
                <h4 className="text-white font-semibold">Wallet Binding</h4>
              </div>
              <p className="text-sm text-gray-400">
                Once claimed, the wallet is linked to the handle. Subsequent claims must 
                use the same wallet, preventing unauthorized claims.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Protocol Dependencies */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">Dependencies</h2>
        <div className="space-y-4">
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <img src="/tokens/usdc.svg" alt="Circle" className="w-8 h-8" />
              <h3 className="text-lg font-bold text-white">Circle USDC</h3>
            </div>
            <p className="text-gray-300 text-sm mb-3">
              PayX uses Circle&apos;s native USDC on Arc Network. USDC is the most trusted 
              stablecoin, backed 1:1 by US dollars and regularly audited.
            </p>
            <a href="https://www.circle.com/en/usdc" target="_blank" rel="noopener" className="text-indigo-400 text-sm hover:text-indigo-300">
              Learn more about USDC →
            </a>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <img src="/chains/arc.png" alt="Arc" className="w-8 h-8" />
              <h3 className="text-lg font-bold text-white">Arc Network</h3>
            </div>
            <p className="text-gray-300 text-sm mb-3">
              Arc is a stablecoin-native L1 by Circle. It provides fast finality and 
              USDC-denominated gas fees.
            </p>
            <a href="https://arc.network" target="_blank" rel="noopener" className="text-indigo-400 text-sm hover:text-indigo-300">
              Learn more about Arc →
            </a>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-[#4e5ee4]/20 rounded-lg flex items-center justify-center">
                <span className="text-[#4e5ee4] font-bold">OZ</span>
              </div>
              <h3 className="text-lg font-bold text-white">OpenZeppelin</h3>
            </div>
            <p className="text-gray-300 text-sm mb-3">
              Our contracts are built on OpenZeppelin&apos;s battle-tested libraries for 
              ERC20, ReentrancyGuard, Ownable, and cryptographic functions.
            </p>
            <a href="https://docs.openzeppelin.com/contracts" target="_blank" rel="noopener" className="text-indigo-400 text-sm hover:text-indigo-300">
              OpenZeppelin documentation →
            </a>
          </div>
        </div>
      </section>

      {/* Risk Considerations */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">Risk Considerations</h2>
        <div className="space-y-4">
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-6">
            <h3 className="text-yellow-200 font-semibold mb-3 flex items-center gap-2">
              <span className="text-yellow-400">⚠️</span>
              Smart Contract Risk
            </h3>
            <p className="text-yellow-200/80 text-sm">
              Despite security measures, smart contracts may contain undiscovered vulnerabilities. 
              Only tip amounts you&apos;re comfortable with and consider starting small.
            </p>
          </div>

          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-6">
            <h3 className="text-yellow-200 font-semibold mb-3 flex items-center gap-2">
              <span className="text-yellow-400">⚠️</span>
              Oracle Risk
            </h3>
            <p className="text-yellow-200/80 text-sm">
              The claim process depends on our oracle service to sign claim authorizations. 
              While designed for high availability, service disruptions could delay claims.
            </p>
          </div>

          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-6">
            <h3 className="text-yellow-200 font-semibold mb-3 flex items-center gap-2">
              <span className="text-yellow-400">⚠️</span>
              Testnet Status
            </h3>
            <p className="text-yellow-200/80 text-sm">
              PayX is currently on Arc Testnet. Expect potential network instability and 
              resets before mainnet launch. Testnet USDC has no real value.
            </p>
          </div>
        </div>
      </section>

      {/* Best Practices */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">Security Best Practices</h2>
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <h3 className="text-lg font-bold text-white mb-4">For Users</h3>
          <ul className="space-y-3 text-gray-300">
            <li className="flex items-start gap-3">
              <span className="text-indigo-400">1.</span>
              <span>Verify contract addresses before interacting</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-indigo-400">2.</span>
              <span>Use a hardware wallet for significant holdings</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-indigo-400">3.</span>
              <span>Review transaction details in your wallet before signing</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-indigo-400">4.</span>
              <span>Be cautious of phishing sites — bookmark the official URLs</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-indigo-400">5.</span>
              <span>Never share your private key or seed phrase</span>
            </li>
          </ul>
        </div>
      </section>

      {/* Contact */}
      <section>
        <h2 className="text-2xl font-bold text-white mb-6">Report a Vulnerability</h2>
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <p className="text-gray-300 mb-4">If you discover a security vulnerability:</p>
          <div className="flex flex-wrap gap-4">
            <a href="https://x.com/Xylonet_" target="_blank" rel="noopener" className="px-4 py-2 bg-indigo-500/20 text-indigo-400 rounded-lg hover:bg-indigo-500/30 transition-colors">
              X (Twitter) @Xylonet_
            </a>
            <a href="https://discord.gg/mcDkHNrFyA" target="_blank" rel="noopener" className="px-4 py-2 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30 transition-colors">
              Discord
            </a>
          </div>
          <p className="text-xs text-gray-500 mt-4">
            Please do not publicly disclose vulnerabilities. Contact us privately first.
          </p>
        </div>
      </section>
    </div>
  );
}
