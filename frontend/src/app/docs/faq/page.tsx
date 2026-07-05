'use client'

import { useState } from 'react'

export default function FAQPage() {
  const faqs = [
    {
      category: 'General',
      questions: [
        {
          q: 'What is XyloNet?',
          a: 'XyloNet is a DeFi protocol built on Arc Network that provides stablecoin swapping, cross-chain bridging, liquidity pools, and yield vaults. It\'s designed specifically for the stablecoin economy on Arc.'
        },
        {
          q: 'What makes XyloNet different from other DEXs?',
          a: 'XyloNet uses a StableSwap AMM (similar to Curve) optimized for stable assets, providing much lower slippage than traditional AMMs. Combined with Arc\'s USDC-native gas and CCTP bridging, it offers the best experience for stablecoin trading.'
        },
        {
          q: 'Is XyloNet safe to use?',
          a: 'XyloNet implements industry-standard security practices including reentrancy guards, access controls, and input validation. However, as with all DeFi protocols, there are inherent smart contract risks. Only deposit what you can afford to lose.'
        },
        {
          q: 'Do I need ETH or other tokens for gas?',
          a: 'No! Arc Network uses USDC as its native gas token. If you have USDC, you can use XyloNet without needing any other tokens.'
        }
      ]
    },
    {
      category: 'Swapping',
      questions: [
        {
          q: 'What tokens can I swap?',
          a: 'Currently, XyloNet supports swapping between USDC, EURC (Euro Coin), and USYC (US Yield Coin). More stablecoins will be added in the future.'
        },
        {
          q: 'Why is slippage so low on XyloNet?',
          a: 'XyloNet uses the StableSwap invariant (Curve algorithm) with an amplification factor of 100, which creates a very flat curve near the peg. This means swapping pegged assets results in minimal price impact.'
        },
        {
          q: 'What are the swap fees?',
          a: 'The swap fee is 0.04% per trade. This fee goes entirely to liquidity providers. There is no protocol fee.'
        },
        {
          q: 'What slippage should I set?',
          a: 'For stablecoin swaps, 0.1% to 0.5% slippage is typically sufficient. Only increase slippage if you\'re making very large trades or during high volatility.'
        }
      ]
    },
    {
      category: 'Bridging',
      questions: [
        {
          q: 'How does the bridge work?',
          a: 'XyloNet uses Circle\'s CCTP V2 protocol. When you bridge, USDC is burned on the source chain, Circle attests to the burn, and then native USDC is minted on Arc. No wrapped tokens involved!'
        },
        {
          q: 'How long does bridging take?',
          a: 'XyloNet uses Circle Bridge Kit with CCTP V2 Fast Transfer mode. Bridges typically complete in ~30 seconds! Fast Transfer uses Circle\'s over-collateralization pool for faster-than-finality settlement, so you don\'t have to wait for source chain finality.'
        },
        {
          q: 'What chains are supported?',
          a: 'Currently, you can bridge USDC from Arc Network to Ethereum Sepolia (testnet). More destination chains including Arbitrum, Base, Optimism, and Polygon are coming soon.'
        },
        {
          q: 'Are there bridge fees?',
          a: 'XyloNet uses Circle Bridge Kit with Fast Transfer, which charges a small relayer fee (~0.1%) to cover the automatic delivery. You also pay minimal gas on Arc (paid in USDC).'
        },
        {
          q: 'Can I bridge tokens other than USDC?',
          a: 'Currently, only USDC can be bridged via CCTP. For other stablecoins, you would need to swap them to USDC first, bridge to Arc, then swap to your desired token.'
        }
      ]
    },
    {
      category: 'Liquidity Pools',
      questions: [
        {
          q: 'How do I earn from providing liquidity?',
          a: 'When you provide liquidity, you receive LP tokens representing your pool share. You earn 0.04% of every swap in that pool, proportional to your share.'
        },
        {
          q: 'What is impermanent loss?',
          a: 'Impermanent loss occurs when token prices change from when you deposited. For stablecoin pools like XyloNet\'s, impermanent loss is minimal (typically < 0.1%) because prices stay close to their peg.'
        },
        {
          q: 'Can I withdraw my liquidity anytime?',
          a: 'Yes, there are no lock-up periods. You can withdraw your liquidity at any time by burning your LP tokens.'
        },
        {
          q: 'What\'s the APR for LPs?',
          a: 'APR varies based on trading volume. Current estimates are ~4-5% APR for active pools. Check the Pools page for live rates.'
        }
      ]
    },
    {
      category: 'Vault',
      questions: [
        {
          q: 'How does the vault generate yield?',
          a: 'The vault primarily generates yield through USYC (US Yield Coin), which is backed by short-term US Treasury bills. This provides stable, real-world yield from government securities.'
        },
        {
          q: 'What are xyUSDC tokens?',
          a: 'xyUSDC is the share token you receive when depositing into the vault. It\'s ERC-20 compatible and appreciates in value as yield accumulates. You can transfer, trade, or use it as collateral.'
        },
        {
          q: 'Is there a lock-up period?',
          a: 'No, you can withdraw from the vault at any time with no penalties or waiting periods.'
        },
        {
          q: 'What\'s the current APY?',
          a: 'The vault APY tracks USYC yield, currently around 4.5-5% APY. This is variable based on US Treasury rates.'
        }
      ]
    },
    {
      category: 'Arc Network',
      questions: [
        {
          q: 'What is Arc Network?',
          a: 'Arc is a stablecoin-native Layer 1 blockchain that uses USDC as its gas token. This means you don\'t need ETH or any other native token - just USDC!'
        },
        {
          q: 'How do I add Arc to my wallet?',
          a: 'Visit the Network Setup page in our docs or use the "Add Network" button. Arc Testnet has Chain ID 5042002 and uses USDC as the currency symbol.'
        },
        {
          q: 'Where can I get testnet USDC?',
          a: 'Visit Circle\'s USDC Faucet at faucet.circle.com, select Arc Testnet, and request test tokens. You can also bridge from other testnets if you have USDC there.'
        },
        {
          q: 'Is Arc mainnet live?',
          a: 'Arc is currently on testnet. Mainnet launch date will be announced by the Arc team. All testnet assets may be reset before mainnet.'
        }
      ]
    }
  ]

  const [openItems, setOpenItems] = useState<Record<string, boolean>>({})

  const toggleItem = (id: string) => {
    setOpenItems(prev => ({ ...prev, [id]: !prev[id] }))
  }

  return (
    <div className="prose prose-invert max-w-none">
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-white mb-4">FAQ</h1>
        <p className="text-xl text-gray-400">
          Frequently asked questions about XyloNet.
        </p>
      </div>

      <div className="space-y-8">
        {faqs.map((section) => (
          <section key={section.category}>
            <h2 className="text-2xl font-bold text-white mb-4">{section.category}</h2>
            <div className="space-y-3">
              {section.questions.map((item, idx) => {
                const itemId = `${section.category}-${idx}`
                const isOpen = openItems[itemId]
                return (
                  <div key={idx} className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                    <button
                      onClick={() => toggleItem(itemId)}
                      className="w-full p-4 text-left flex items-center justify-between hover:bg-white/5 transition-colors"
                    >
                      <span className="text-white font-medium pr-4">{item.q}</span>
                      <svg
                        className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {isOpen && (
                      <div className="px-4 pb-4 text-gray-300 text-sm border-t border-white/10 pt-4">
                        {item.a}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </section>
        ))}
      </div>

      <section className="mt-12">
        <div className="bg-gradient-to-r from-[#0A786A]/10 to-[#01C38E]/10 border border-[#0A786A]/30 rounded-xl p-6 text-center">
          <h3 className="text-xl font-bold text-white mb-2">Still have questions?</h3>
          <p className="text-gray-300 mb-4">Join our community for support and discussions.</p>
          <div className="flex justify-center gap-4">
            <a href="https://discord.gg/mcDkHNrFyA" target="_blank" rel="noopener" className="px-4 py-2 bg-[#0A786A]/20 text-[#0A786A] rounded-lg hover:bg-[#0A786A]/30 transition-colors">
              Join Discord
            </a>
            <a href="https://x.com/Xylonet_" target="_blank" rel="noopener" className="px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors">
              Follow on X
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
