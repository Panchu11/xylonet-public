# XyloNet Integration Pack

Everything a third-party platform (trading terminal, aggregator, wallet, dashboard) needs to integrate **XyloSwap** (StableSwap DEX) and **XyloBridge** (Circle CCTP V2) on **Arc**.

- `addresses.json` — machine-readable chain config, contract/token addresses, protocol parameters
- `abis/` — clean ABI files: `XyloRouter`, `XyloFactory`, `XyloStablePool`, `XyloBridge`
- Human docs: https://xylonet.xyz/docs (integration, swap, bridge, contracts, network)

Everything below reflects the **deployed testnet contracts** and has been verified against the chain. All addresses are **Arc Testnet (chain ID `5042002`)**; mainnet addresses will be published at Arc mainnet launch with **identical interfaces**, so integrations built against testnet carry over with a config change only.

---

## 1. Arc chain integration notes

| Item | Value |
|---|---|
| Chain ID | `5042002` |
| RPC endpoints | See `addresses.json` (primary + 4 fallbacks) |
| Explorer | https://testnet.arcscan.app |
| Gas token | **USDC** — Arc has no separate native coin. `eth_gasPrice` / fee fields are denominated in native USDC. Typical tx cost is ~a cent. |
| Finality | Deterministic, sub-second |
| CCTP V2 domain | `26` |

The USDC-as-gas model is the main thing to adapt for: balance checks, gas estimation, and "max" amount calculations must treat USDC as both the trading asset and the fee asset.

## 2. DEX (XyloSwap) — quoting and execution

Architecture: `XyloFactory` deploys one canonical 2-asset StableSwap pool per token pair (Curve-style, amplification `A = 200`, swap fee **4 bps**). `XyloRouter` is the recommended entry point; it resolves pools via the factory, so integrators never need pool addresses.

### Quoting (view calls, no gas)

```solidity
// Single hop
uint256 out = router.getAmountOut(tokenIn, tokenOut, amountIn);

// Multi-hop (e.g. EURC -> USDC -> USYC; all paths route through USDC today)
uint256[] memory amounts = router.getAmountsOut(amountIn, [EURC, USDC, USYC]);
```

`router.quote(tokenIn, tokenOut, amountIn)` additionally returns `priceImpact` in basis points, **computed against a 1:1 ideal rate**. This is meaningful for same-peg pairs only; for cross-currency pairs like USDC/EURC (a genuine FX pair) the figure includes the FX rate itself — use `getAmountsOut` deltas for price-impact display on those pairs.

### Execution

Recommended: **exact-input swaps** via the Uniswap-V2-style interface:

```solidity
IERC20(USDC).approve(ROUTER, amountIn);
router.swapExactTokensForTokens(
    amountIn,
    minAmountOut,          // slippage protection
    [USDC, EURC],          // path (multi-hop supported)
    recipient,
    deadline
);
```

Single-transaction UX (no separate approve): all three listed tokens — including native USDC — support **EIP-2612 permit** (verified on-chain), so `router.swapWithPermit(swapParams, permitDeadline, v, r, s)` executes approve + swap in one transaction.

**Note on `swapTokensForExactTokens`:** the deployed implementation derives the required input from the forward quote plus a 0.01% buffer rather than an exact inverse calculation, and does not enforce the requested output as a strict minimum. For terminal-grade execution guarantees, use `swapExactTokensForTokens` (exact-in) — this is the path our own UI uses.

### Events / indexing

- `XyloRouter` emits `Swap(sender, tokenIn, tokenOut, amountIn, amountOut, to)` per router-level swap.
- Each `XyloStablePool` emits its own `Swap`, `AddLiquidity`, `RemoveLiquidity` events (see `abis/XyloStablePool.json` for exact signatures).
- A hosted GraphQL indexer (Envio) with `Swap`, `Pool`, `LiquidityEvent`, `DailyVolume` entities is available for historical data — endpoint available on request.

### Current testnet market status (honest disclosure)

- **USDC-EURC**: seeded and functional. Because testnet has no arbitrageurs, the pool ratio is not pinned to the real EUR/USD rate — quotes are mechanically correct but not market-realistic.
- **USDC-USYC**: pool deployed; liquidity seeding in progress. Until seeded, quotes on this pair revert.
- Mainnet pools will launch with real liquidity provisioning and live arbitrage.

## 3. Bridge — two integration options

### Option A (recommended for terminals): Circle CCTP V2 directly

Arc has first-class CCTP V2 support. Integrate `TokenMessengerV2.depositForBurn(...)` on the source chain, poll Circle's attestation API, then `MessageTransmitterV2.receiveMessage(message, attestation)` on the destination. This gives you **Fast Transfer (~30s)** by setting `maxFee > 0` and `minFinalityThreshold = 1000`. This is what XyloNet's own bridge UI does (via Circle's App Kit / Bridge Kit). If you already run CCTP on other chains, your existing infra works as-is — Arc is just domain `26`.

### Option B: XyloBridge contract (single-call wrapper)

```solidity
IERC20(USDC).approve(XYLO_BRIDGE, amount);
bridge.bridgeOut(
    amount,                       // USDC, 6 decimals
    destinationDomain,            // e.g. 6 = Base
    bytes32(uint256(uint160(recipient)))  // or use bridge.addressToBytes32(recipient)
);
```

- Executes a CCTP V2 **Standard Transfer** (`maxFee = 0`, finality threshold 2000). **No protocol fee** — XyloNet charges nothing on bridging.
- 25 destination domains are enabled on-chain (Ethereum, Base, Arbitrum, Optimism, Polygon, Avalanche, Unichain, Linea, Sonic, World Chain, Monad, Sei, BNB, HyperEVM, Ink, Plume, and more — full list via `getDomainId(name)` / `isDomainSupported(id)`).
- Use **`bridgeOut`** (domain-ID based). Do not use `bridgeToChain` — it is a legacy convenience path that will be reworked; `bridgeOut` is the supported entry point.
- `bridgeIn(message, attestation)` completes inbound transfers, or call `MessageTransmitterV2.receiveMessage` directly — USDC is minted to the recipient encoded in the message either way.

## 4. Suggested integration checklist

1. Add Arc chain config (chain ID, RPCs, explorer, USDC-as-gas handling)
2. Add token list: USDC / EURC / USYC (all 6 decimals, all permit-capable)
3. Quote via `getAmountsOut`; execute via `swapExactTokensForTokens` (or `swapWithPermit` for 1-tx UX)
4. Index router/pool `Swap` events for history (or request our GraphQL endpoint)
5. Bridge via direct CCTP V2 (fast) or `XyloBridge.bridgeOut` (standard, zero-fee)
6. Point config at mainnet addresses when published at Arc mainnet launch

## 5. Contact & support

- Discord: https://discord.gg/mcDkHNrFyA
- X: https://x.com/Xylonet_
- GitHub issues: https://github.com/Panchu11/xylonet-public/issues
