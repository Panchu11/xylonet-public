# XyloNet Smart Contracts

## Overview

The XyloNet smart contract suite is the onchain foundation of the XyloNet protocol — a stablecoin-focused DeFi stack built natively for the Arc ecosystem. The contracts implement a Curve-inspired 2-asset StableSwap decentralized exchange, an ERC-4626 style yield vault, a Circle CCTP V2 cross-chain USDC bridge wrapper, and the supporting infrastructure (factory, router, LP token) required to compose them into a unified liquidity and payment protocol.

All core contracts are written in Solidity, target the Arc EVM-equivalent execution environment, and are designed for production use with stablecoins such as USDC, EURC, and USYC. The system emphasizes gas efficiency, secure accounting, reentrancy protection, and clean separation between pool logic, routing logic, vault logic, and bridge logic.

This repository uses both Hardhat and Foundry, giving contributors flexibility in compilation, testing, and deployment workflows.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         User / DApp / SDK                            │
└─────────────────────────────────┬───────────────────────────────────┘
                                  │
                    ┌─────────────▼──────────────┐
                    │      XyloRouter            │
                    │   (user-facing entrypoint) │
                    └──────┬──────────────┬──────┘
                           │              │
              ┌────────────▼─────┐  ┌─────▼────────────┐
              │   XyloFactory    │  │   XyloVault      │
              │  (pool registry) │  │  (ERC-4626 vault)│
              └────────┬─────────┘  └──────────────────┘
                       │
              ┌────────▼─────────┐
              │ XyloStablePool   │
              │ (2-coin StableSwap│
              │  Curve-like AMM) │
              └──────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                         XyloBridge                                   │
│            (Circle CCTP V2 wrapper for cross-chain USDC)             │
└─────────────────────────────────────────────────────────────────────┘
```

The router is the recommended entry point for all DEX operations. It handles slippage protection, deadlines, permit-based gasless approvals, and multi-hop path routing. Pools are created through the factory and are self-contained StableSwap markets. The vault accepts pool LP tokens or stablecoin deposits, deploys them into strategies, and accrues yield through harvest cycles. The bridge is a standalone wrapper around Circle's TokenMessengerV2 and MessageTransmitterV2 contracts, enabling permissioned USDC burns and mints across 25+ supported chains.

---

## Core Contracts

### XyloFactory

**File:** `contracts/src/core/XyloFactory.sol`  
**Deployed (Arc Testnet):** `0x60EDeFB094B84BBC6430cc130B358A43Ba1979e2`

`XyloFactory` is the canonical registry and deployment factory for all XyloNet StableSwap pools.

Key responsibilities:
- Deploys new 2-asset StableSwap pools via `createPool(tokenA, tokenB, amplificationParameter)`.
- Enforces default protocol parameters:
  - Default swap fee: **4 bps (0.04%)**, hard-capped at **1%**.
  - Default amplification parameter: **200**.
- Maintains a pool registry using an O(1) 2D mapping keyed by token pair.
- Provides `rampA()` and `stopRampA()` for gradual, time-locked adjustments to the amplification parameter, preventing sudden invariant shocks.

The factory guarantees that each unordered token pair maps to exactly one canonical pool, simplifying integrations for frontends, indexers, and aggregators.

---

### XyloStablePool

**File:** `contracts/src/core/XyloStablePool.sol`  
**Examples (Arc Testnet):**
- USDC-EURC Pool: `0x3DF3966F5138143dce7a9cFDdC2c0310ce083BB1`
- USDC-USYC Pool: `0x8296cC7477A9CD12cF632042fDDc2aB89151bb61`

`XyloStablePool` implements a 2-coin Curve-like StableSwap automated market maker. It is optimized for assets that trade near parity (e.g., USDC/EURC, USDC/USYC), using an amplification parameter to tighten slippage around the peg while preserving the constant-product-like behavior further from parity.

Core functions:

| Function | Purpose |
|----------|---------|
| `swap(tokenIn, tokenOut, amountIn, minAmountOut, to, deadline)` | Execute a stablecoin swap with slippage and deadline protection. |
| `addLiquidity(amounts[], minLpTokens, to, deadline)` | Deposit both pool assets and receive LP tokens. |
| `removeLiquidity(amount, minAmounts, to, deadline)` | Burn LP tokens and withdraw proportional reserves. |
| `removeLiquidityOne(tokenOut, lpAmount, minAmountOut, to, deadline)` | Burn LP tokens and withdraw a single asset. |
| `calculateSwap(...)` | Off-chain quote for a swap. |
| `calculateAddLiquidity(...)` | Off-chain quote for adding liquidity. |
| `calculateRemoveLiquidity(...)` | Off-chain quote for removing liquidity. |

Implementation highlights:
- **StableSwap invariant** solved iteratively via Newton's method.
- **Decimal normalization** to handle 6-decimal stablecoins (e.g., USDC) alongside 18-decimal tokens.
- **Reentrancy guard** on all state-mutating functions.
- **Deadline validation** to protect against stale transactions.
- **LP token** inherits from `XyloERC20` with EIP-2612 permit support.

---

### XyloRouter

**File:** `contracts/src/core/XyloRouter.sol`  
**Deployed (Arc Testnet):** `0x73742278c31a76dBb0D2587d03ef92E6E2141023`

`XyloRouter` is the primary user-facing entry point for all DEX interactions. It abstracts pool-specific mechanics and provides a Uniswap-like interface for swaps, liquidity management, and price discovery.

Core functions:

| Function | Purpose |
|----------|---------|
| `swap(amounts, path, to, deadline)` | Internal-style swap with precomputed amounts. |
| `swapExactTokensForTokens(amountIn, amountOutMin, path, to, deadline)` | Swap an exact input amount along a token path. |
| `swapTokensForExactTokens(amountOut, amountInMax, path, to, deadline)` | Swap up to a maximum input to receive an exact output. |
| `swapWithPermit(...)` | Gasless swap using EIP-2612 permit approvals. |
| `addLiquidity(...)` | Add liquidity to a pool through the router. |
| `removeLiquidity(...)` | Remove liquidity through the router. |
| `removeLiquidityOne(...)` | Single-asset withdrawal through the router. |
| `getAmountOut(...)` | Quote output for a single hop. |
| `getAmountsOut(...)` | Quote outputs for a multi-hop path. |
| `quote(...)` | Return price impact in basis points for a proposed trade. |

The router supports **multi-hop routing** through path arrays, enabling indirect swaps such as EURC → USDC → USYC by chaining multiple pools in a single transaction.

---

### XyloERC20

**File:** `contracts/src/core/XyloERC20.sol`

`XyloERC20` is a lightweight ERC-20 implementation used as the base contract for pool LP tokens and vault shares. It adds **EIP-2612 permit** support, allowing holders to approve spenders via off-chain signatures rather than on-chain `approve` transactions. This removes the gas cost and UX friction of a separate approval step for swaps, liquidity additions, and vault deposits.

---

### XyloVault

**File:** `contracts/src/vault/XyloVault.sol`  
**Deployed (Arc Testnet):** `0x240Eb85458CD41361bd8C3773253a1D78054f747`

`XyloVault` is an ERC-4626 style yield vault that accepts stablecoin deposits, deploys them into an underlying strategy, and distributes accrued yield to share holders.

Core functions:

| Function | Purpose |
|----------|---------|
| `deposit(assets, receiver)` | Deposit assets and mint vault shares to `receiver`. |
| `withdraw(assets, receiver, owner)` | Withdraw assets by redeeming shares (with optional allowance logic). |
| `redeem(shares, receiver, owner)` | Burn an exact number of shares to receive underlying assets. |
| `harvest()` | Collect strategy profits, realize gains, and take performance fee. |
| `convertToShares(assets)` | Preview shares minted for a given asset deposit. |
| `convertToAssets(shares)` | Preview assets returned for a given share burn. |

Fee structure (all configurable by admin, with hard caps):
- Deposit fee: **0%**
- Withdrawal fee: **0.1%**
- Performance fee: **10%**
- Maximum fee across all dimensions: **20%**

Admin capabilities:
- `setStrategy()` — migrate the underlying yield strategy.
- `setFees()` — update fee parameters within protocol limits.
- `emergencyWithdraw()` — recover funds in exceptional circumstances.

The vault uses share-based accounting to ensure that depositors receive a fair, proportional claim on vault assets regardless of when yield is harvested.

---

### XyloBridge

**File:** `contracts/src/bridge/XyloBridge.sol`  
**Deployed (Arc Testnet):** `0xf7Df65Ce418E938ee8d9a0A0d227A43441fe4641`

`XyloBridge` wraps Circle's Cross-Chain Transfer Protocol (CCTP) V2 to enable USDC transfers between Arc and 25+ supported destination chains, including Ethereum, Base, Arbitrum, Polygon, Solana, and others.

Core functions:

| Function | Purpose |
|----------|---------|
| `bridgeOut(amount, destinationDomain, recipient)` | Burn USDC on Arc and initiate a mint on the destination domain. |
| `bridgeToChain(amount, chainName, recipient)` | Same as `bridgeOut`, but accepts a human-readable chain name. |
| `bridgeIn(message, attestation)` | Complete an incoming bridge by validating Circle's attestation. |

Stats tracking:
- `totalBridgedIn`
- `totalBridgedOut`
- `bridgeCount`

Circle CCTP V2 references:
- **TokenMessengerV2:** `0x8FE6B999Dc680CcFDD5Bf7EB0974218be2542DAA`
- **MessageTransmitterV2:** `0xE737e5cEBEEBa77EFE34D4aa090756590b1CE275`

The contract handles domain mapping, recipient encoding, and message attestation verification, presenting a simple interface for users and integrations.

---

## Deployed Addresses (Arc Testnet, Chain ID 5042002)

| Contract | Address |
|----------|---------|
| XyloFactory | `0x60EDeFB094B84BBC6430cc130B358A43Ba1979e2` |
| XyloRouter | `0x73742278c31a76dBb0D2587d03ef92E6E2141023` |
| XyloBridge | `0xf7Df65Ce418E938ee8d9a0A0d227A43441fe4641` |
| XyloVault | `0x240Eb85458CD41361bd8C3773253a1D78054f747` |
| USDC-EURC Pool | `0x3DF3966F5138143dce7a9cFDdC2c0310ce083BB1` |
| USDC-USYC Pool | `0x8296cC7477A9CD12cF632042fDDc2aB89151bb61` |

---

## Build Commands

### Hardhat

```bash
npx hardhat compile
```

### Foundry

```bash
forge build
```

To install dependencies before building:

```bash
npm install
```

or, if using Foundry exclusively:

```bash
forge install
```

---

## Testing

Run the full Hardhat test suite:

```bash
npx hardhat test
```

Run Foundry tests:

```bash
forge test
```

Recommended practice is to run both suites before any deployment or upgrade:

```bash
npx hardhat test && forge test
```

Tests cover:
- StableSwap invariant correctness
- Swap, add, and remove liquidity accounting
- Router slippage and deadline enforcement
- Permit-based gasless approvals
- Vault deposit/withdraw/harvest flows
- Bridge burn/mint lifecycle simulations
- Fee boundaries and admin privilege limits

---

## Security Features

- **Reentrancy guards** on all state-mutating pool, vault, and bridge functions.
- **Deadline validation** on time-sensitive DEX operations.
- **Slippage protection** via `minAmountOut` and `amountInMax` parameters.
- **Access control** on factory ramping, vault admin functions, and fee changes.
- **Hard fee caps** to prevent runaway fee extraction.
- **EIP-2612 permit** to eliminate standalone approve transactions.
- **Curve-like StableSwap invariant** with iterative Newton-Raphson solving.
- **CCTP V2 attestation verification** for secure cross-chain message validation.

---

## Repository Structure

```
contracts/
├── src/
│   ├── core/
│   │   ├── XyloFactory.sol
│   │   ├── XyloStablePool.sol
│   │   ├── XyloRouter.sol
│   │   └── XyloERC20.sol
│   ├── vault/
│   │   └── XyloVault.sol
│   └── bridge/
│       └── XyloBridge.sol
├── script/              # Deployment and utility scripts
├── scripts/             # Additional automation scripts
├── test/                # Hardhat and Foundry tests
├── foundry.toml         # Foundry configuration
├── hardhat.config.js    # Hardhat configuration
└── remappings.txt       # Solidity import remappings
```

---

## Integration Notes

When integrating with XyloNet contracts:

1. Prefer the **XyloRouter** over direct pool interaction — it handles path routing, slippage, deadlines, and permits.
2. Use **off-chain quote functions** (`calculateSwap`, `getAmountsOut`, `convertToAssets`) to preview outcomes before submitting transactions.
3. For cross-chain USDC, ensure the recipient address is correctly encoded for the destination domain (EVM vs. Solana).
4. Vault share conversions are subject to accrued yield and fees; always preview via `convertToAssets` or `convertToShares`.
5. LP tokens support EIP-2612 `permit`; use this to enable one-click deposits and swaps in your frontend.

---

## License

This codebase is released under the license specified in the repository root (`LICENSE`).
