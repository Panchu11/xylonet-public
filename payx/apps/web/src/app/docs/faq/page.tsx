'use client';

import { useState } from 'react';

export default function FAQPage() {
  const faqs = [
    {
      category: 'General',
      questions: [
        {
          q: 'What is PayX?',
          a: 'PayX is a tipping protocol built on Arc Network that lets you send USDC tips to any X/Twitter user. Tips are held in escrow until the creator verifies their X account and claims them to any wallet.'
        },
        {
          q: 'How is PayX different from other tipping platforms?',
          a: 'PayX is non-custodial and blockchain-based. Tips are held in a smart contract (not by us), creators don\'t need a wallet to receive tips, and everything is transparent on-chain. Plus, Arc Network\'s sub-second finality means tips arrive instantly.'
        },
        {
          q: 'Is PayX safe to use?',
          a: 'PayX uses a verified smart contract with industry-standard security practices including reentrancy guards and OpenZeppelin libraries. However, as with all DeFi, there are inherent smart contract risks. Start with small amounts.'
        },
        {
          q: 'What blockchain is PayX on?',
          a: 'PayX is built on Arc Network (Testnet) — Circle\'s stablecoin-native Layer 1 blockchain. Arc uses USDC as its native gas token, so you don\'t need ETH or any other token.'
        }
      ]
    },
    {
      category: 'Tipping',
      questions: [
        {
          q: 'How do I send a tip?',
          a: 'Install the PayX Chrome extension, browse X.com, and click the "Tip" button that appears under each tweet. Select an amount, add an optional message, and confirm the transaction in your wallet.'
        },
        {
          q: 'What\'s the minimum tip amount?',
          a: 'The minimum tip is $0.10 USDC. This ensures that tips are meaningful while keeping the platform accessible to everyone.'
        },
        {
          q: 'What are the fees?',
          a: 'PayX charges a 1% platform fee on tips. Additionally, there\'s a small gas fee (~$0.01) paid in USDC to Arc Network. For example, on a $10 tip: $0.10 platform fee + ~$0.01 gas = $0.11 total fees.'
        },
        {
          q: 'Can I tip any X user?',
          a: 'Yes! You can tip any public X account. The tip is held in escrow under their handle until they claim it. They don\'t need a wallet or PayX account to receive tips.'
        },
        {
          q: 'Can I add a message to my tip?',
          a: 'Yes, you can include an optional message (up to 280 characters) with your tip. Messages are stored on-chain and visible to the recipient when they claim.'
        }
      ]
    },
    {
      category: 'Claiming Tips',
      questions: [
        {
          q: 'How do I claim my tips?',
          a: 'Visit the PayX claim page, sign in with your X account (OAuth), and you\'ll see your pending balance. Connect a wallet and click "Claim" to withdraw your USDC.'
        },
        {
          q: 'Do I need a wallet to receive tips?',
          a: 'No! Anyone can tip your X handle even if you don\'t have a wallet. You only need a wallet when you\'re ready to claim and withdraw your tips.'
        },
        {
          q: 'How long do tips stay in escrow?',
          a: 'Tips remain in escrow indefinitely until claimed. There\'s no expiration — your tips will be waiting whenever you\'re ready to claim them.'
        },
        {
          q: 'Can I claim partial amounts?',
          a: 'No, each claim withdraws your entire pending balance at once. This is more gas-efficient and simplifies the claim process.'
        },
        {
          q: 'What happens if I change my X handle?',
          a: 'Tips are tied to your X user ID (not your display handle), so changing your handle doesn\'t affect existing tips. You can still claim them.'
        },
        {
          q: 'Can I change my linked wallet?',
          a: 'Once you claim for the first time, your wallet is linked to your X handle for security. Changing the linked wallet requires re-verification through X OAuth.'
        }
      ]
    },
    {
      category: 'Chrome Extension',
      questions: [
        {
          q: 'Where can I get the Chrome extension?',
          a: 'The extension will be available on Chrome Web Store soon. For now, you can manually install it from the PayX repository using Chrome\'s developer mode.'
        },
        {
          q: 'Is the extension safe?',
          a: 'Yes. The extension never has access to your private keys — all transactions are signed by your wallet (MetaMask, etc.). We only request permissions needed to add tip buttons to X.com.'
        },
        {
          q: 'The tip button isn\'t showing up?',
          a: 'Try refreshing the X.com page, make sure the extension is enabled in chrome://extensions, or try disabling and re-enabling it. The button should appear below each tweet.'
        },
        {
          q: 'What wallets are supported?',
          a: 'Any Web3 wallet that supports EVM chains works with PayX — MetaMask, Rabby, Coinbase Wallet, etc. Just make sure you\'re connected to Arc Testnet.'
        }
      ]
    },
    {
      category: 'Arc Network',
      questions: [
        {
          q: 'What is Arc Network?',
          a: 'Arc is Circle\'s stablecoin-native Layer 1 blockchain. It uses USDC as its native gas token, has sub-second finality (~350ms), and is purpose-built for the stablecoin economy.'
        },
        {
          q: 'How do I add Arc to my wallet?',
          a: 'Add Arc Testnet manually with Chain ID: 5042002, RPC: https://rpc.testnet.arc.network, and USDC as the currency symbol. Or use our Quick Start guide for step-by-step instructions.'
        },
        {
          q: 'Where can I get testnet USDC?',
          a: 'Visit Circle\'s USDC Faucet at faucet.circle.com, select "Arc Testnet", enter your wallet address, and request test tokens. You\'ll receive testnet USDC for free.'
        },
        {
          q: 'Is Arc mainnet live?',
          a: 'Arc is currently on testnet. Mainnet launch date will be announced by Circle/Arc team. All testnet assets (including tips) may be reset before mainnet.'
        }
      ]
    },
    {
      category: 'Technical',
      questions: [
        {
          q: 'Is the smart contract verified?',
          a: 'Yes! The PayX contract is fully verified on ArcScan. You can view the source code at: testnet.arcscan.app/address/0xA312c384770B7b49E371DF4b7AF730EFEF465913#code'
        },
        {
          q: 'How does claim verification work?',
          a: 'When you claim, you sign in with X (OAuth) to prove handle ownership. Our backend then generates a signature that the smart contract verifies before releasing funds. This ensures only the real account owner can claim.'
        },
        {
          q: 'What libraries does PayX use?',
          a: 'PayX is built with OpenZeppelin\'s battle-tested contracts for security (ReentrancyGuard, SafeERC20, Ownable, ECDSA). The frontend uses Next.js, and the extension is vanilla JS with ethers.js.'
        },
        {
          q: 'Can I integrate PayX into my app?',
          a: 'Yes! The smart contract is public and verified. You can query pending balances, tip history, and more using standard Web3 libraries. See our Contracts documentation for details.'
        }
      ]
    }
  ];

  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});

  const toggleItem = (id: string) => {
    setOpenItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="prose prose-invert max-w-none">
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-white mb-4">FAQ</h1>
        <p className="text-xl text-gray-400">
          Frequently asked questions about PayX.
        </p>
      </div>

      <div className="space-y-8">
        {faqs.map((section) => (
          <section key={section.category}>
            <h2 className="text-2xl font-bold text-white mb-4">{section.category}</h2>
            <div className="space-y-3">
              {section.questions.map((item, idx) => {
                const itemId = `${section.category}-${idx}`;
                const isOpen = openItems[itemId];
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
                );
              })}
            </div>
          </section>
        ))}
      </div>

      <section className="mt-12">
        <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/30 rounded-xl p-6 text-center">
          <h3 className="text-xl font-bold text-white mb-2">Still have questions?</h3>
          <p className="text-gray-300 mb-4">Join our community for support and discussions.</p>
          <div className="flex justify-center gap-4">
            <a href="https://discord.gg/mcDkHNrFyA" target="_blank" rel="noopener" className="px-4 py-2 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30 transition-colors">
              Join Discord
            </a>
            <a href="https://x.com/Xylonet_" target="_blank" rel="noopener" className="px-4 py-2 bg-indigo-500/20 text-indigo-400 rounded-lg hover:bg-indigo-500/30 transition-colors">
              Follow on X
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
