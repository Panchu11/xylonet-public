'use client';

export default function ClaimingPage() {
  return (
    <div className="prose prose-invert max-w-none">
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-white mb-4">Claiming Tips</h1>
        <p className="text-xl text-gray-400">
          Learn how to verify your X account and claim your tips to any wallet.
        </p>
      </div>

      {/* Overview */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">How Claiming Works</h2>
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <p className="text-gray-300 mb-4">
            Tips are held in escrow until you prove you own the X handle. The claim process uses:
          </p>
          <div className="grid md:grid-cols-2 gap-4 mt-6">
            <div className="p-4 bg-white/5 rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" fill="#1DA1F2"/>
                </svg>
                <span className="text-white font-semibold">X OAuth</span>
              </div>
              <p className="text-sm text-gray-400">Sign in with X to prove handle ownership</p>
            </div>
            <div className="p-4 bg-white/5 rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <svg className="w-6 h-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
                <span className="text-white font-semibold">Oracle Signature</span>
              </div>
              <p className="text-sm text-gray-400">Backend signs a claim authorization</p>
            </div>
          </div>
        </div>
      </section>

      {/* Step by Step */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">Claim Process</h2>
        <div className="space-y-4">
          {/* Step 1 */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-indigo-500/20 rounded-lg flex items-center justify-center text-indigo-400 font-bold shrink-0">1</div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Visit Claim Page</h3>
                <p className="text-gray-400 text-sm mb-3">
                  Go to <a href="/claim" className="text-indigo-400 hover:text-indigo-300">/claim</a> on PayX
                </p>
                <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                  <p className="text-xs text-gray-500">You can check if you have pending tips before signing in</p>
                </div>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center text-purple-400 font-bold shrink-0">2</div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Sign in with X</h3>
                <p className="text-gray-400 text-sm mb-3">
                  Click the &quot;Sign in with X&quot; button to authenticate via OAuth
                </p>
                <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                  <p className="text-xs text-gray-500">We only request read access to your profile. No posting permissions.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-cyan-500/20 rounded-lg flex items-center justify-center text-cyan-400 font-bold shrink-0">3</div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">View Pending Balance</h3>
                <p className="text-gray-400 text-sm mb-3">
                  See your total pending tips from all your fans
                </p>
                <div className="p-4 bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border border-emerald-500/20 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Pending Balance</span>
                    <div className="flex items-center gap-2">
                      <img src="/tokens/usdc.svg" alt="USDC" className="w-5 h-5" />
                      <span className="text-2xl font-bold text-white">$24.50</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Step 4 */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center text-emerald-400 font-bold shrink-0">4</div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Connect Wallet & Claim</h3>
                <p className="text-gray-400 text-sm mb-3">
                  Connect your wallet and click &quot;Claim&quot; to receive your USDC
                </p>
                <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                  <p className="text-xs text-gray-500">USDC will be sent directly to your connected wallet on Arc Network</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Wallet Linking */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">Wallet Linking</h2>
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <p className="text-gray-300 mb-4">
            The first time you claim, your wallet is linked to your X handle. This provides:
          </p>
          <ul className="space-y-3 text-gray-300">
            <li className="flex items-start gap-3">
              <span className="text-emerald-400 mt-1">✓</span>
              <div>
                <strong className="text-white">Automatic future claims</strong>
                <p className="text-sm text-gray-400 mt-1">Future tips can be claimed to the same wallet without re-verification</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-emerald-400 mt-1">✓</span>
              <div>
                <strong className="text-white">Security</strong>
                <p className="text-sm text-gray-400 mt-1">Only your linked wallet can claim tips for your handle</p>
              </div>
            </li>
          </ul>
          
          <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
            <p className="text-yellow-200 text-sm flex items-start gap-2">
              <span className="text-yellow-400">⚠️</span>
              <span>Choose your wallet carefully! Changing the linked wallet requires re-verification.</span>
            </p>
          </div>
        </div>
      </section>

      {/* Technical Details */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">Technical Details</h2>
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <h3 className="text-white font-semibold mb-4">Claim Transaction</h3>
          <p className="text-gray-400 text-sm mb-4">
            The claim function on the smart contract:
          </p>
          <div className="bg-[#0a0b0f] rounded-lg p-4 font-mono text-sm overflow-x-auto">
            <pre className="text-gray-300">
{`function claimTips(
    string calldata handle,    // Your X handle
    address wallet,            // Destination wallet
    bytes32 nonce,             // Unique nonce
    bytes calldata signature   // Oracle signature
) external`}
            </pre>
          </div>
          
          <h3 className="text-white font-semibold mt-6 mb-4">Signature Verification</h3>
          <p className="text-gray-400 text-sm mb-4">
            The contract verifies that the signature was created by our oracle:
          </p>
          <div className="bg-[#0a0b0f] rounded-lg p-4 font-mono text-sm overflow-x-auto">
            <pre className="text-gray-300">
{`bytes32 messageHash = keccak256(
    abi.encodePacked(handle, wallet, nonce)
);
bytes32 ethSignedHash = messageHash.toEthSignedMessageHash();
address signer = ethSignedHash.recover(signature);
require(signer == oracleSigner, "Invalid signature");`}
            </pre>
          </div>
        </div>
      </section>

      {/* Claim Event */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">On-Chain Events</h2>
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <p className="text-gray-300 mb-4">
            Successful claims emit a <code className="text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded">TipsClaimed</code> event:
          </p>
          <div className="bg-[#0a0b0f] rounded-lg p-4 font-mono text-sm overflow-x-auto">
            <pre className="text-gray-300">
{`event TipsClaimed(
    string indexed handleHash,  // Keccak256 of handle
    string handle,              // "@username"
    address indexed wallet,     // Recipient wallet
    uint256 amount,             // Total claimed
    uint256 timestamp           // Block timestamp
);`}
            </pre>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section>
        <h2 className="text-2xl font-bold text-white mb-6">Common Questions</h2>
        <div className="space-y-4">
          <div className="bg-white/5 border border-white/10 rounded-xl p-5">
            <h4 className="text-white font-semibold mb-2">How long do tips stay in escrow?</h4>
            <p className="text-gray-400 text-sm">Tips remain in escrow indefinitely until claimed. There&apos;s no expiration.</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-5">
            <h4 className="text-white font-semibold mb-2">Can I claim partial amounts?</h4>
            <p className="text-gray-400 text-sm">No, each claim withdraws your entire pending balance at once.</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-5">
            <h4 className="text-white font-semibold mb-2">What if I change my X handle?</h4>
            <p className="text-gray-400 text-sm">Tips are tied to your X user ID, not your handle. Handle changes don&apos;t affect existing tips.</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-5">
            <h4 className="text-white font-semibold mb-2">Can someone else claim my tips?</h4>
            <p className="text-gray-400 text-sm">No. Only the verified X account owner (via OAuth) can claim tips for that handle.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
