'use client'

export default function IntegrationPage() {
  return (
    <div className="prose prose-invert max-w-none">
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-white mb-4">Integration Guide</h1>
        <p className="text-xl text-gray-400">
          Learn how to integrate XyloNet into your dApp, wallet, or protocol.
        </p>
      </div>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">Quick Start</h2>
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <p className="text-gray-300 mb-4">XyloNet provides three main integration points:</p>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
              <h3 className="text-blue-400 font-semibold mb-2">Swap Integration</h3>
              <p className="text-gray-400 text-sm">Execute stablecoin swaps with minimal slippage</p>
            </div>
            <div className="bg-[#0A786A]/10 border border-[#0A786A]/30 rounded-lg p-4">
              <h3 className="text-[#0A786A] font-semibold mb-2">Bridge Integration</h3>
              <p className="text-gray-400 text-sm">Bridge native USDC from any supported chain</p>
            </div>
            <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-4">
              <h3 className="text-cyan-400 font-semibold mb-2">Vault Integration</h3>
              <p className="text-gray-400 text-sm">Deposit and earn yield on USDC</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">Contract Addresses</h2>
        <div className="bg-[#0f172a] border border-white/10 rounded-xl p-6 font-mono text-sm">
          <p className="text-gray-400 mb-4">// Arc Testnet (Chain ID: 5042002)</p>
          <div className="space-y-2">
            <p><span className="text-[#0A786A]">FACTORY</span> = <span className="text-green-400">"0x60EDeFB094B84BBC6430cc130B358A43Ba1979e2"</span></p>
            <p><span className="text-[#0A786A]">ROUTER</span> = <span className="text-green-400">"0x73742278c31a76dBb0D2587d03ef92E6E2141023"</span></p>
            <p><span className="text-[#0A786A]">BRIDGE</span> = <span className="text-green-400">"0xf7Df65Ce418E938ee8d9a0A0d227A43441fe4641"</span></p>
            <p><span className="text-[#0A786A]">VAULT</span> = <span className="text-green-400">"0x240Eb85458CD41361bd8C3773253a1D78054f747"</span></p>
            <p className="mt-4 text-gray-400">// Pools</p>
            <p><span className="text-[#0A786A]">USDC_EURC_POOL</span> = <span className="text-green-400">"0x3DF3966F5138143dce7a9cFDdC2c0310ce083BB1"</span></p>
            <p><span className="text-[#0A786A]">USDC_USYC_POOL</span> = <span className="text-green-400">"0x8296cC7477A9CD12cF632042fDDc2aB89151bb61"</span></p>
            <p className="mt-4 text-gray-400">// Tokens</p>
            <p><span className="text-[#0A786A]">USDC</span> = <span className="text-green-400">"0x3600000000000000000000000000000000000000"</span></p>
            <p><span className="text-[#0A786A]">EURC</span> = <span className="text-green-400">"0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a"</span></p>
            <p><span className="text-[#0A786A]">USYC</span> = <span className="text-green-400">"0xe9185F0c5F296Ed1797AaE4238D26CCaBEadb86C"</span></p>
          </div>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">Swap Integration</h2>
        <div className="space-y-6">
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">Get Quote</h3>
            <p className="text-gray-300 mb-4">Get the expected output amount for a swap:</p>
            <div className="bg-[#0f172a] rounded-lg p-4 font-mono text-sm overflow-x-auto">
              <pre className="text-gray-300">{`// Solidity
function getAmountOut(
    address pool,
    address tokenIn,
    address tokenOut,
    uint256 amountIn
) external view returns (uint256 amountOut);

// Example: Get quote for 1000 USDC -> EURC
uint256 amountOut = router.getAmountOut(
    0x3DF3966F5138143dce7a9cFDdC2c0310ce083BB1, // USDC-EURC pool
    0x3600000000000000000000000000000000000000, // USDC
    0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a, // EURC
    1000 * 1e6 // 1000 USDC (6 decimals)
);`}</pre>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">Execute Swap</h3>
            <p className="text-gray-300 mb-4">Execute a swap through the router:</p>
            <div className="bg-[#0f172a] rounded-lg p-4 font-mono text-sm overflow-x-auto">
              <pre className="text-gray-300">{`// Solidity
function swap(
    address pool,
    address tokenIn,
    address tokenOut,
    uint256 amountIn,
    uint256 minAmountOut,
    address to,
    uint256 deadline
) external returns (uint256 amountOut);

// Example: Swap 1000 USDC for EURC with 0.5% slippage
IERC20(USDC).approve(router, 1000 * 1e6);

uint256 received = router.swap(
    USDC_EURC_POOL,
    USDC,
    EURC,
    1000 * 1e6,           // Amount in
    995 * 1e6,            // Min amount out (0.5% slippage)
    msg.sender,           // Recipient
    block.timestamp + 300 // 5 min deadline
);`}</pre>
            </div>
          </div>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">Vault Integration</h2>
        <div className="space-y-6">
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">Deposit USDC</h3>
            <div className="bg-[#0f172a] rounded-lg p-4 font-mono text-sm overflow-x-auto">
              <pre className="text-gray-300">{`// ERC-4626 Standard
function deposit(
    uint256 assets,  // USDC amount
    address receiver // Share recipient
) external returns (uint256 shares);

// Example
IERC20(USDC).approve(vault, 1000 * 1e6);
uint256 shares = IXyloVault(vault).deposit(1000 * 1e6, msg.sender);`}</pre>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">Withdraw USDC</h3>
            <div className="bg-[#0f172a] rounded-lg p-4 font-mono text-sm overflow-x-auto">
              <pre className="text-gray-300">{`// Withdraw by asset amount
function withdraw(
    uint256 assets,
    address receiver,
    address owner
) external returns (uint256 shares);

// Withdraw by share amount
function redeem(
    uint256 shares,
    address receiver,
    address owner
) external returns (uint256 assets);`}</pre>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">Read Functions</h3>
            <div className="bg-[#0f172a] rounded-lg p-4 font-mono text-sm overflow-x-auto">
              <pre className="text-gray-300">{`// Get total assets in vault
uint256 total = vault.totalAssets();

// Convert shares to assets
uint256 assets = vault.convertToAssets(shares);

// Convert assets to shares
uint256 shares = vault.convertToShares(assets);

// Preview deposit/withdraw
uint256 shares = vault.previewDeposit(assets);
uint256 assets = vault.previewWithdraw(shares);`}</pre>
            </div>
          </div>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">JavaScript/TypeScript SDK</h2>
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <p className="text-gray-300 mb-4">Use wagmi/viem for easy integration:</p>
          <div className="bg-[#0f172a] rounded-lg p-4 font-mono text-sm overflow-x-auto">
            <pre className="text-gray-300">{`import { useWriteContract, useReadContract } from 'wagmi'

const ROUTER_ABI = [...] // Import from ABI files

// Read quote
const { data: quote } = useReadContract({
  address: '0x73742278c31a76dBb0D2587d03ef92E6E2141023',
  abi: ROUTER_ABI,
  functionName: 'getAmountOut',
  args: [poolAddress, tokenIn, tokenOut, amountIn]
})

// Execute swap
const { writeContract } = useWriteContract()
writeContract({
  address: '0x73742278c31a76dBb0D2587d03ef92E6E2141023',
  abi: ROUTER_ABI,
  functionName: 'swap',
  args: [pool, tokenIn, tokenOut, amountIn, minOut, recipient, deadline]
})`}</pre>
          </div>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">Events</h2>
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <p className="text-gray-300 mb-4">Monitor protocol activity by listening to events:</p>
          <div className="bg-[#0f172a] rounded-lg p-4 font-mono text-sm overflow-x-auto">
            <pre className="text-gray-300">{`// Pool Events
event Swap(
    address indexed sender,
    address indexed tokenIn,
    address indexed tokenOut,
    uint256 amountIn,
    uint256 amountOut,
    address to
);

event AddLiquidity(
    address indexed provider,
    uint256[] amounts,
    uint256 lpTokens
);

event RemoveLiquidity(
    address indexed provider,
    uint256[] amounts,
    uint256 lpTokens
);

// Vault Events
event Deposit(
    address indexed sender,
    address indexed owner,
    uint256 assets,
    uint256 shares
);

event Withdraw(
    address indexed sender,
    address indexed receiver,
    address indexed owner,
    uint256 assets,
    uint256 shares
);`}</pre>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-white mb-6">Need Help?</h2>
        <div className="bg-gradient-to-r from-[#0A786A]/10 to-[#01C38E]/10 border border-[#0A786A]/30 rounded-xl p-6">
          <p className="text-gray-300 mb-4">For integration support:</p>
          <div className="flex flex-wrap gap-4">
            <span className="px-4 py-2 bg-gray-500/10 text-gray-500 rounded-lg cursor-not-allowed">GitHub (Coming Soon)</span>
            <a href="https://discord.gg/mcDkHNrFyA" target="_blank" rel="noopener" className="px-4 py-2 bg-white/10 rounded-lg text-white hover:bg-white/20 transition-colors">Discord</a>
            <a href="https://x.com/Xylonet_" target="_blank" rel="noopener" className="px-4 py-2 bg-white/10 rounded-lg text-white hover:bg-white/20 transition-colors">X (Twitter)</a>
          </div>
        </div>
      </section>
    </div>
  )
}
