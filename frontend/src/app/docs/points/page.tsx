'use client';

import Link from 'next/link';

export default function PointsDocumentation() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-12">
          <Link 
            href="/docs" 
            className="text-cyan-400 hover:text-cyan-300 text-sm mb-4 inline-block"
          >
            ← Back to Documentation
          </Link>
          <h1 className="text-4xl font-bold text-white mb-4">
            XyloNet Points System
          </h1>
          <p className="text-gray-400 text-lg">
            Complete guide to earning, tracking, and maximizing your XyloNet Points
          </p>
        </div>

        {/* Table of Contents */}
        <div className="bg-gray-800/50 rounded-xl p-6 mb-10 border border-gray-700">
          <h2 className="text-xl font-semibold text-white mb-4">Table of Contents</h2>
          <ul className="space-y-2 text-gray-300">
            <li><a href="#overview" className="hover:text-cyan-400">1. Overview</a></li>
            <li><a href="#earning-points" className="hover:text-cyan-400">2. Earning Points</a></li>
            <li><a href="#volume-points" className="hover:text-cyan-400">3. Volume Points (Logarithmic Scaling)</a></li>
            <li><a href="#milestones" className="hover:text-cyan-400">4. Milestone Rewards</a></li>
            <li><a href="#first-interactions" className="hover:text-cyan-400">5. First Interaction Bonuses</a></li>
            <li><a href="#quality-score" className="hover:text-cyan-400">6. Quality Score & Multipliers</a></li>
            <li><a href="#referrals" className="hover:text-cyan-400">7. Referral Program</a></li>
            <li><a href="#social-tasks" className="hover:text-cyan-400">8. Social Tasks</a></li>
            <li><a href="#examples" className="hover:text-cyan-400">9. Point Calculation Examples</a></li>
            <li><a href="#faq" className="hover:text-cyan-400">10. FAQ</a></li>
          </ul>
        </div>

        {/* Overview */}
        <section id="overview" className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <span className="text-cyan-400">1.</span> Overview
          </h2>
          <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700">
            <p className="text-gray-300 mb-4">
              XyloNet Points reward active users who contribute to the ecosystem. Points are calculated based on your on-chain activity, social engagement, and referrals.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <div className="bg-gray-900/50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-cyan-400">Swap</div>
                <div className="text-gray-400 text-sm">Trade tokens</div>
              </div>
              <div className="bg-gray-900/50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-[#0A786A]">Vault</div>
                <div className="text-gray-400 text-sm">Deposit & earn</div>
              </div>
              <div className="bg-gray-900/50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-green-400">PayX</div>
                <div className="text-gray-400 text-sm">Send tips</div>
              </div>
              <div className="bg-gray-900/50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-orange-400">Referrals</div>
                <div className="text-gray-400 text-sm">Invite friends</div>
              </div>
            </div>
          </div>
        </section>

        {/* Earning Points */}
        <section id="earning-points" className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <span className="text-cyan-400">2.</span> Earning Points
          </h2>
          <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700">
            <p className="text-gray-300 mb-6">
              There are multiple ways to earn points on XyloNet:
            </p>
            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 bg-gray-900/50 rounded-lg">
                <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-cyan-400 font-bold">1</span>
                </div>
                <div>
                  <h3 className="text-white font-semibold">Volume Points</h3>
                  <p className="text-gray-400 text-sm">Earn points based on your trading/deposit volume using logarithmic scaling</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 bg-gray-900/50 rounded-lg">
                <div className="w-10 h-10 rounded-full bg-[#0A786A]/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-[#0A786A] font-bold">2</span>
                </div>
                <div>
                  <h3 className="text-white font-semibold">Milestone Rewards</h3>
                  <p className="text-gray-400 text-sm">Unlock one-time bonuses when reaching volume milestones</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 bg-gray-900/50 rounded-lg">
                <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-green-400 font-bold">3</span>
                </div>
                <div>
                  <h3 className="text-white font-semibold">First Interaction Bonuses</h3>
                  <p className="text-gray-400 text-sm">Get bonus points for trying each product for the first time</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 bg-gray-900/50 rounded-lg">
                <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-orange-400 font-bold">4</span>
                </div>
                <div>
                  <h3 className="text-white font-semibold">Referrals</h3>
                  <p className="text-gray-400 text-sm">Invite friends and earn points when they become active</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 bg-gray-900/50 rounded-lg">
                <div className="w-10 h-10 rounded-full bg-[#01C38E]/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-[#01C38E] font-bold">5</span>
                </div>
                <div>
                  <h3 className="text-white font-semibold">Social Tasks</h3>
                  <p className="text-gray-400 text-sm">Complete social tasks like following on Twitter and joining Discord</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Volume Points */}
        <section id="volume-points" className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <span className="text-cyan-400">3.</span> Volume Points (Logarithmic Scaling)
          </h2>
          <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700">
            <p className="text-gray-300 mb-4">
              Volume points use a <span className="text-cyan-400 font-semibold">logarithmic formula</span> to prevent gaming while rewarding genuine activity:
            </p>
            
            <div className="bg-gray-900 rounded-lg p-4 mb-6 font-mono text-center">
              <span className="text-cyan-400">Points</span> = <span className="text-[#0A786A]">log₂</span>(1 + <span className="text-green-400">volume</span> / <span className="text-orange-400">baseVolume</span>) × <span className="text-[#01C38E]">multiplier</span>
            </div>

            <h3 className="text-white font-semibold mb-3">Product Configuration</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-400 border-b border-gray-700">
                    <th className="text-left py-3 px-4">Product</th>
                    <th className="text-right py-3 px-4">Base Volume</th>
                    <th className="text-right py-3 px-4">Multiplier</th>
                    <th className="text-right py-3 px-4">Min Tx</th>
                    <th className="text-right py-3 px-4">Daily Cap</th>
                  </tr>
                </thead>
                <tbody className="text-gray-300">
                  <tr className="border-b border-gray-700/50">
                    <td className="py-3 px-4 font-medium text-cyan-400">Swap</td>
                    <td className="text-right py-3 px-4">$10</td>
                    <td className="text-right py-3 px-4">5×</td>
                    <td className="text-right py-3 px-4">$5</td>
                    <td className="text-right py-3 px-4">200 pts</td>
                  </tr>
                  <tr className="border-b border-gray-700/50">
                    <td className="py-3 px-4 font-medium text-[#0A786A]">Vault</td>
                    <td className="text-right py-3 px-4">$25</td>
                    <td className="text-right py-3 px-4">8×</td>
                    <td className="text-right py-3 px-4">$10</td>
                    <td className="text-right py-3 px-4">100 pts</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-medium text-green-400">PayX Tips</td>
                    <td className="text-right py-3 px-4">$1</td>
                    <td className="text-right py-3 px-4">3×</td>
                    <td className="text-right py-3 px-4">$0.01</td>
                    <td className="text-right py-3 px-4">50 pts</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="mt-6 p-4 bg-cyan-500/10 rounded-lg border border-cyan-500/30">
              <h4 className="text-cyan-400 font-semibold mb-2">💡 Why Logarithmic?</h4>
              <p className="text-gray-300 text-sm">
                Logarithmic scaling means <span className="text-white">diminishing returns</span> as volume increases. 
                This makes the system fair for small users while still rewarding whales, and prevents point farming through wash trading.
              </p>
            </div>
          </div>
        </section>

        {/* Milestones */}
        <section id="milestones" className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <span className="text-cyan-400">4.</span> Milestone Rewards
          </h2>
          <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700">
            <p className="text-gray-300 mb-6">
              Reach cumulative volume thresholds to unlock <span className="text-yellow-400">one-time bonus points</span>:
            </p>

            {/* Swap Milestones */}
            <div className="mb-6">
              <h3 className="text-cyan-400 font-semibold mb-3">Swap Milestones</h3>
              <div className="grid grid-cols-5 gap-2">
                {[
                  { tier: 'Bronze', vol: '$50', pts: 25 },
                  { tier: 'Silver', vol: '$250', pts: 75 },
                  { tier: 'Gold', vol: '$1,000', pts: 150 },
                  { tier: 'Platinum', vol: '$5,000', pts: 300 },
                  { tier: 'Diamond', vol: '$25,000', pts: 500 },
                ].map((m) => (
                  <div key={m.tier} className="bg-gray-900/50 rounded-lg p-3 text-center">
                    <div className="text-xs text-gray-500">{m.tier}</div>
                    <div className="text-sm text-gray-300">{m.vol}</div>
                    <div className="text-cyan-400 font-bold">+{m.pts}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Vault Milestones */}
            <div className="mb-6">
              <h3 className="text-[#0A786A] font-semibold mb-3">Vault Milestones</h3>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { tier: 'Bronze', vol: '$50', pts: 20 },
                  { tier: 'Silver', vol: '$250', pts: 60 },
                  { tier: 'Gold', vol: '$1,000', pts: 125 },
                  { tier: 'Platinum', vol: '$5,000', pts: 250 },
                ].map((m) => (
                  <div key={m.tier} className="bg-gray-900/50 rounded-lg p-3 text-center">
                    <div className="text-xs text-gray-500">{m.tier}</div>
                    <div className="text-sm text-gray-300">{m.vol}</div>
                    <div className="text-[#0A786A] font-bold">+{m.pts}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* PayX Milestones */}
            <div>
              <h3 className="text-green-400 font-semibold mb-3">PayX Milestones</h3>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { tier: 'Bronze', vol: '$10', pts: 20 },
                  { tier: 'Silver', vol: '$50', pts: 50 },
                  { tier: 'Gold', vol: '$250', pts: 100 },
                  { tier: 'Platinum', vol: '$1,000', pts: 190 },
                ].map((m) => (
                  <div key={m.tier} className="bg-gray-900/50 rounded-lg p-3 text-center">
                    <div className="text-xs text-gray-500">{m.tier}</div>
                    <div className="text-sm text-gray-300">{m.vol}</div>
                    <div className="text-green-400 font-bold">+{m.pts}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* First Interactions */}
        <section id="first-interactions" className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <span className="text-cyan-400">5.</span> First Interaction Bonuses
          </h2>
          <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700">
            <p className="text-gray-300 mb-6">
              Get rewarded for trying each product for the first time:
            </p>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-cyan-500/20 to-cyan-600/10 rounded-xl p-5 border border-cyan-500/30">
                <div className="text-3xl font-bold text-cyan-400 mb-2">+50</div>
                <div className="text-white font-semibold">First Swap</div>
                <div className="text-gray-400 text-sm mt-1">Min $5 swap volume</div>
              </div>
              <div className="bg-gradient-to-br from-[#0A786A]/20 to-[#0A786A]/10 rounded-xl p-5 border border-[#0A786A]/30">
                <div className="text-3xl font-bold text-[#01C38E] mb-2">+50</div>
                <div className="text-white font-semibold">First Vault Deposit</div>
                <div className="text-gray-400 text-sm mt-1">Min $10 deposit</div>
              </div>
              <div className="bg-gradient-to-br from-green-500/20 to-green-600/10 rounded-xl p-5 border border-green-500/30">
                <div className="text-3xl font-bold text-green-400 mb-2">+50</div>
                <div className="text-white font-semibold">First PayX Tip</div>
                <div className="text-gray-400 text-sm mt-1">Min $1 tip sent</div>
              </div>
            </div>
            <div className="mt-4 p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/30">
              <p className="text-yellow-400 text-sm">
                <span className="font-bold">Total First Interaction Bonus:</span> Up to <span className="font-bold">150 points</span> for trying all products!
              </p>
            </div>
          </div>
        </section>

        {/* Quality Score */}
        <section id="quality-score" className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <span className="text-cyan-400">6.</span> Quality Score & Multipliers
          </h2>
          <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700">
            <p className="text-gray-300 mb-6">
              Your <span className="text-cyan-400">Quality Score</span> (0-100) determines a multiplier applied to your volume points. 
              This rewards genuine, consistent users over bots and farmers.
            </p>

            <h3 className="text-white font-semibold mb-3">How Quality Score is Calculated</h3>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between items-center p-3 bg-gray-900/50 rounded-lg">
                <span className="text-gray-300">Account Age</span>
                <span className="text-cyan-400">1 pt/day (max 25)</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-900/50 rounded-lg">
                <span className="text-gray-300">Product Diversity</span>
                <span className="text-cyan-400">5-25 pts (based on products used)</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-900/50 rounded-lg">
                <span className="text-gray-300">Activity Consistency</span>
                <span className="text-cyan-400">Up to 25 pts</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-900/50 rounded-lg">
                <span className="text-gray-300">Average Tx Size</span>
                <span className="text-cyan-400">5-15 pts</span>
              </div>
            </div>

            <h3 className="text-white font-semibold mb-3">Multiplier Tiers</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-400 border-b border-gray-700">
                    <th className="text-left py-3 px-4">Score Range</th>
                    <th className="text-left py-3 px-4">Category</th>
                    <th className="text-right py-3 px-4">Multiplier</th>
                  </tr>
                </thead>
                <tbody className="text-gray-300">
                  <tr className="border-b border-gray-700/50">
                    <td className="py-3 px-4">0-20</td>
                    <td className="py-3 px-4 text-red-400">Suspected Bot</td>
                    <td className="text-right py-3 px-4 font-bold text-red-400">0.5×</td>
                  </tr>
                  <tr className="border-b border-gray-700/50">
                    <td className="py-3 px-4">21-40</td>
                    <td className="py-3 px-4 text-orange-400">New User</td>
                    <td className="text-right py-3 px-4 font-bold text-orange-400">0.75×</td>
                  </tr>
                  <tr className="border-b border-gray-700/50">
                    <td className="py-3 px-4">41-60</td>
                    <td className="py-3 px-4 text-gray-300">Normal</td>
                    <td className="text-right py-3 px-4 font-bold">1.0×</td>
                  </tr>
                  <tr className="border-b border-gray-700/50">
                    <td className="py-3 px-4">61-80</td>
                    <td className="py-3 px-4 text-cyan-400">Quality User</td>
                    <td className="text-right py-3 px-4 font-bold text-cyan-400">1.15×</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4">81-100</td>
                    <td className="py-3 px-4 text-yellow-400">Premium User</td>
                    <td className="text-right py-3 px-4 font-bold text-yellow-400">1.25×</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Referrals */}
        <section id="referrals" className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <span className="text-cyan-400">7.</span> Referral Program
          </h2>
          <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700">
            <p className="text-gray-300 mb-6">
              Invite friends and earn points when they become active users. Points use a <span className="text-orange-400">tier-based decay system</span>:
            </p>

            <div className="grid md:grid-cols-4 gap-4 mb-6">
              <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/10 rounded-xl p-4 border border-orange-500/30 text-center">
                <div className="text-2xl font-bold text-orange-400 mb-1">50 pts</div>
                <div className="text-white text-sm">Referrals 1-10</div>
              </div>
              <div className="bg-gradient-to-br from-orange-400/15 to-orange-500/10 rounded-xl p-4 border border-orange-400/30 text-center">
                <div className="text-2xl font-bold text-orange-300 mb-1">25 pts</div>
                <div className="text-white text-sm">Referrals 11-25</div>
              </div>
              <div className="bg-gradient-to-br from-gray-500/20 to-gray-600/10 rounded-xl p-4 border border-gray-500/30 text-center">
                <div className="text-2xl font-bold text-gray-300 mb-1">10 pts</div>
                <div className="text-white text-sm">Referrals 26-50</div>
              </div>
              <div className="bg-gradient-to-br from-gray-600/20 to-gray-700/10 rounded-xl p-4 border border-gray-600/30 text-center">
                <div className="text-2xl font-bold text-gray-400 mb-1">5 pts</div>
                <div className="text-white text-sm">Referrals 51+</div>
              </div>
            </div>

            <h3 className="text-white font-semibold mb-3">Referral Qualification</h3>
            <p className="text-gray-400 text-sm mb-4">
              A referral counts as &quot;successful&quot; when the referred user meets these criteria:
            </p>
            <ul className="text-gray-300 space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <span className="text-green-400">✓</span> Account age ≥ 48 hours
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-400">✓</span> Total volume ≥ $100
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-400">✓</span> Used at least 2 products
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-400">✓</span> Active on at least 3 different days
              </li>
            </ul>

            <div className="mt-4 p-4 bg-green-500/10 rounded-lg border border-green-500/30">
              <p className="text-green-400 text-sm">
                <span className="font-bold">Referred User Bonus:</span> If you were referred and qualify with $100+ volume, you earn <span className="font-bold">+50 bonus points</span>!
              </p>
            </div>
          </div>
        </section>

        {/* Social Tasks */}
        <section id="social-tasks" className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <span className="text-cyan-400">8.</span> Social Tasks
          </h2>
          <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700">
            <p className="text-gray-300 mb-6">
              Complete social tasks to earn additional points:
            </p>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-4 bg-gray-900/50 rounded-lg border border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                  </div>
                  <div>
                    <div className="text-white font-medium">Follow @XyloNet on X</div>
                    <div className="text-gray-400 text-sm">Stay updated with latest news</div>
                  </div>
                </div>
                <div className="text-cyan-400 font-bold text-lg">+50 pts</div>
              </div>
              <div className="flex justify-between items-center p-4 bg-gray-900/50 rounded-lg border border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#0A786A]/20 flex items-center justify-center">
                    <svg className="w-5 h-5 text-[#01C38E]" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03z"/>
                    </svg>
                  </div>
                  <div>
                    <div className="text-white font-medium">Join Discord Server</div>
                    <div className="text-gray-400 text-sm">Connect with the community</div>
                  </div>
                </div>
                <div className="text-cyan-400 font-bold text-lg">+50 pts</div>
              </div>
            </div>
            <div className="mt-4 p-4 bg-[#0A786A]/10 rounded-lg border border-[#0A786A]/30">
              <p className="text-[#01C38E] text-sm">
                <span className="font-bold">Note:</span> Social tasks are one-time only. New tasks may be added periodically - points are automatically calculated on completion!
              </p>
            </div>
          </div>
        </section>

        {/* Examples */}
        <section id="examples" className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <span className="text-cyan-400">9.</span> Point Calculation Examples
          </h2>
          <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700">
            
            {/* Example 1 */}
            <div className="mb-8">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <span className="bg-cyan-500/20 text-cyan-400 px-2 py-1 rounded text-sm">Example 1</span>
                New User with $100 Swap Volume
              </h3>
              <div className="bg-gray-900/50 rounded-lg p-4 font-mono text-sm space-y-2">
                <div className="text-gray-400"># Volume Points</div>
                <div>log₂(1 + 100/10) × 5 = log₂(11) × 5 = <span className="text-cyan-400">17.3 ≈ 17 pts</span></div>
                <div className="text-gray-400 mt-2"># Quality Multiplier (new user, score ~30)</div>
                <div>17 × 0.75 = <span className="text-cyan-400">12.75 ≈ 12 pts</span></div>
                <div className="text-gray-400 mt-2"># First Swap Bonus</div>
                <div>+ <span className="text-green-400">50 pts</span></div>
                <div className="text-gray-400 mt-2"># Bronze Milestone ($50+)</div>
                <div>+ <span className="text-yellow-400">25 pts</span></div>
                <div className="border-t border-gray-700 mt-3 pt-3">
                  <span className="text-white font-bold">Total: 87 points</span>
                </div>
              </div>
            </div>

            {/* Example 2 */}
            <div className="mb-8">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <span className="bg-[#0A786A]/20 text-[#0A786A] px-2 py-1 rounded text-sm">Example 2</span>
                Active User with Multi-Product Usage
              </h3>
              <div className="bg-gray-900/50 rounded-lg p-4 font-mono text-sm space-y-2">
                <div className="text-gray-400"># Swap: $500 volume</div>
                <div>log₂(1 + 500/10) × 5 = <span className="text-cyan-400">28 pts</span></div>
                <div className="text-gray-400 mt-2"># Vault: $200 volume</div>
                <div>log₂(1 + 200/25) × 8 = <span className="text-[#0A786A]">24 pts</span></div>
                <div className="text-gray-400 mt-2"># PayX: $25 tips</div>
                <div>log₂(1 + 25/1) × 3 = <span className="text-green-400">13 pts</span></div>
                <div className="text-gray-400 mt-2"># Quality Multiplier (quality user, score 70)</div>
                <div>(28 + 24 + 13) × 1.15 = <span className="text-cyan-400">74.75 ≈ 74 pts</span></div>
                <div className="text-gray-400 mt-2"># First Interactions</div>
                <div>50 + 50 + 50 = <span className="text-green-400">150 pts</span></div>
                <div className="text-gray-400 mt-2"># Milestones (Swap Silver, Vault Bronze, PayX Silver)</div>
                <div>75 + 20 + 50 = <span className="text-yellow-400">145 pts</span></div>
                <div className="text-gray-400 mt-2"># Social Tasks</div>
                <div>50 + 50 = <span className="text-[#01C38E]">100 pts</span></div>
                <div className="border-t border-gray-700 mt-3 pt-3">
                  <span className="text-white font-bold">Total: 469 points</span>
                </div>
              </div>
            </div>

            {/* Example 3 */}
            <div>
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <span className="bg-orange-500/20 text-orange-400 px-2 py-1 rounded text-sm">Example 3</span>
                Referral Champion (15 successful referrals)
              </h3>
              <div className="bg-gray-900/50 rounded-lg p-4 font-mono text-sm space-y-2">
                <div className="text-gray-400"># First 10 referrals</div>
                <div>10 × 50 = <span className="text-orange-400">500 pts</span></div>
                <div className="text-gray-400 mt-2"># Referrals 11-15</div>
                <div>5 × 25 = <span className="text-orange-300">125 pts</span></div>
                <div className="border-t border-gray-700 mt-3 pt-3">
                  <span className="text-white font-bold">Referral Total: 625 points</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <span className="text-cyan-400">10.</span> Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700">
              <h3 className="text-white font-semibold mb-2">When are points updated?</h3>
              <p className="text-gray-400">
                Points are calculated and updated daily at midnight UTC. New transactions are tracked in real-time 
                but your point totals are recalculated once per day.
              </p>
            </div>
            <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700">
              <h3 className="text-white font-semibold mb-2">Is there a lifetime cap on points?</h3>
              <p className="text-gray-400">
                No! There are daily caps per product to prevent gaming, but there is no lifetime cap. 
                You can continue earning points indefinitely through consistent activity.
              </p>
            </div>
            <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700">
              <h3 className="text-white font-semibold mb-2">Why do I have a low quality score?</h3>
              <p className="text-gray-400">
                Quality score improves over time. It considers account age, product diversity, 
                activity consistency, and transaction sizes. Keep using XyloNet regularly and 
                your score will naturally improve!
              </p>
            </div>
            <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700">
              <h3 className="text-white font-semibold mb-2">How do I get my referral link?</h3>
              <p className="text-gray-400">
                Visit the Points page while connected with your wallet. Your unique referral code 
                will be displayed there. Share it with friends to start earning referral points!
              </p>
            </div>
            <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700">
              <h3 className="text-white font-semibold mb-2">What can I do with points?</h3>
              <p className="text-gray-400">
                Points represent your contribution to the XyloNet ecosystem. They may be used for 
                future airdrops, governance participation, and exclusive rewards. Stay tuned for announcements!
              </p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <div className="text-center text-gray-500 text-sm mt-12 pt-8 border-t border-gray-800">
          <p>Last updated: January 2026</p>
          <p className="mt-2">Questions? Join our <a href="https://discord.gg/xylonet" className="text-cyan-400 hover:underline">Discord</a> community!</p>
        </div>
      </div>
    </div>
  );
}
