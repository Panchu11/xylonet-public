# XyloNet: Stablecoin-Native DeFi and Social Payments on Arc Network

**Version 1.1 | January 2026**  
**Scope**: Accurate description of current implementation on Arc Testnet, without tokenomics.  
**Note**: This document reflects the behavior of the deployed contracts and code as of January 2026; operational parameters (e.g. gas cost) may change over time.

---

## 1. Abstract

XyloNet is a stablecoin-native DeFi and social payments protocol deployed on Arc Network, Circle's EVM-compatible blockchain with native USDC gas.

The system combines:

- **XyloSwap** – a StableSwap AMM for efficient USDC/EURC/USYC swaps
- **XyloBridge** – a Circle CCTP V2–based bridge for native USDC across multiple testnet domains
- **XyloVault** – a yield vault with ERC-4626-style share accounting over a stablecoin asset
- **PayX** – a USDC social tipping protocol for X (Twitter), including Chrome extension, web apps, API backend, Supabase analytics, and a Twitter bot
- **Points System** – an internal, code-implemented points engine that scores on-chain activity and social tasks

All components are live on **Arc Testnet** and operate exclusively on test assets. This whitepaper describes the architecture and mechanics as implemented in the codebase, not aspirational roadmap items.

---

## 2. Network and Deployment Context

### 2.1 Arc Network (Testnet)

XyloNet currently runs on Arc Testnet:

- **Chain ID**: `5042002`
- **RPC**: `https://rpc.testnet.arc.network`
- **Explorer**: `https://testnet.arcscan.app`
- **Gas token**: native USDC at `0x3600000000000000000000000000000000000000`

All references in this document are to testnet deployments; no mainnet deployment is assumed.

### 2.2 Core Contract Addresses (Arc Testnet)

From the code and configuration (`frontend/src/config/constants.ts`, `XYLONET_PROJECT.md`):

- **XyloFactory**: `0x60EDeFB094B84BBC6430cc130B358A43Ba1979e2`
- **XyloRouter**: `0x73742278c31a76dBb0D2587d03ef92E6E2141023`
- **XyloBridge**: `0xf7Df65Ce418E938ee8d9a0A0d227A43441fe4641`
- **XyloVault**: `0x240Eb85458CD41361bd8C3773253a1D78054f747`
- **USDC–EURC Pool**: `0x3DF3966F5138143dce7a9cFDdC2c0310ce083BB1`
- **USDC–USYC Pool**: `0x8296cC7477A9CD12cF632042fDDc2aB89151bb61`

CCTP V2 contracts on Arc Testnet:

- **TokenMessengerV2**: `0x8FE6B999Dc680CcFDD5Bf7EB0974218be2542DAA`
- **MessageTransmitterV2**: `0xE737e5cEBEEBa77EFE34D4aa090756590b1CE275`

PayX specific:

- **PayXTipping**: `0xA312c384770B7b49E371DF4b7AF730EFEF465913`
- **PayX USDC**: same native USDC as above (`0x3600…0000`)

These addresses are hard-coded in the frontend configuration and used throughout the app.

---

## 3. System Architecture

### 3.1 On-Chain Components

XyloNet’s smart contract layer consists of:

- **XyloFactory** (`contracts/src/core/XyloFactory.sol`)
  - Deploys and registers 2-asset StableSwap pools
  - Holds global parameters: `swapFee` (bps), `protocolFee` (bps share of swap fee, *not currently enforced in pools*), default amplification parameter `defaultA`
  - Tracks all pools and enforces uniqueness for each token pair

- **XyloStablePool** (`contracts/src/core/XyloStablePool.sol`)
  - Implements a 2-coin StableSwap invariant with amplification parameter A
  - Normalizes reserves to 18 decimals using precision multipliers
  - Issues LP tokens via `XyloERC20`
  - Provides view functions for quotes and state, and state-changing `swap`, `addLiquidity`, `removeLiquidity`, `removeLiquidityOne`

- **XyloRouter** (`contracts/src/core/XyloRouter.sol`)
  - User-facing router for swaps and liquidity operations
  - Implements `SwapParams`, multi-hop swaps, and `swapWithPermit` for EIP-2612
  - Integrates with XyloFactory to discover pools

- **XyloVault** (`contracts/src/vault/XyloVault.sol`)
  - ERC-20 share vault around a stablecoin asset (e.g. USDC)
  - Provides ERC-4626-style `deposit`, `mint`, `withdraw`, `redeem`, `preview*`, and `convert*` functions
  - Maintains fee parameters for deposit, withdraw, and performance

- **XyloBridge** (`contracts/src/bridge/XyloBridge.sol`)
  - Wrapper around Circle CCTP V2 contracts
  - Bridges native USDC by burning on Arc and minting on destination chains via CCTP

- **PayXTipping** (ABI in `frontend/src/config/abis/PayXTipping.ts`)
  - Escrows USDC tips keyed by X (Twitter) handles
  - Allows tips to be claimed to a wallet using an off-chain signature from the PayX backend
  - Tracks handle-level aggregates (pending, total received, total claimed, tip count, linked wallet)

### 3.2 Off-Chain and Frontend Components

Off-chain and UI components include:

- **XyloNet Frontend** (`frontend/`)
  - Next.js 16 App Router, TypeScript, Tailwind CSS
  - Uses wagmi v2 and viem for contract interactions
  - Views:
    - `/` – landing page with XyloNet and PayX showcase
    - `/swap` (via `SwapWidget`) – stablecoin swap interface
    - `/bridge` (via `BridgeWidget`) – USDC bridging UI using Circle Bridge Kit
    - `/pools`, `/vault` – liquidity and vault views
    - `/history` – transaction history combining local storage and Arcscan API

- **PayX Frontend (embedded)** (`frontend/src/app/payx/...`)
  - `/payx` – PayX marketing and stats page
  - `/payx/claim` – claim flow: sign in with X, connect wallet, claim tips
  - `/payx/dashboard` – creator dashboard summarizing tips and linked wallet

- **PayX Web** (`payx/apps/web`)
  - Separate Next.js app focused on PayX flows, similar content and UX.

- **PayX API** (`payx/apps/api`)
  - Express server with OAuth and session management
  - Routes:
    - `/api/auth` – X OAuth and user session
    - `/api/claim` – generation of `nonce` and `signature` for `claimTips`
    - `/api/tips` – handle-based tip info and history
    - `/api/health` – health checks

- **Supabase Integration** (`frontend/src/lib/payx-supabase.ts`)
  - Tables for PayX users and tips
  - Aggregation functions for PayX stats and recent tips

- **Points System** (`frontend/src/lib/points/*`, `/api/points/*`)
  - Goldsky-based indexer for XyloNet swaps, vault interactions, and PayX tips
  - Points calculation for swaps, vault, PayX, referrals, milestones, and social tasks

- **Twitter Bot** (`frontend/src/lib/twitter-bot/*`)
  - Cron-driven bot that composes and posts PayX stats and summaries
  - Uses Supabase for configuration, quotas, and logs

---

## 4. XyloSwap: StableSwap AMM

### 4.1 Pool Creation and Configuration

`XyloFactory` deploys pools via `createPool(tokenA, tokenB, amplificationParameter)`:

- Rejects identical or zero addresses
- Sorts tokens to `(token0, token1)` to maintain deterministic ordering
- Enforces one pool per token pair
- Uses `amplificationParameter` if non-zero, otherwise falls back to `defaultA` (initially 200)
- Queries ERC-20 `symbol()` for both tokens to form LP `name` and `symbol`

Each pool is an instance of `XyloStablePool` with:

- Two immutable token addresses: `token0`, `token1`
- Token decimals read from the underlying ERC-20 contracts
- Precision multipliers to normalize reserves to 18 decimals
- Amplification parameters `initialA`, `futureA`, `initialATime`, `futureATime`
- Swap fee `swapFee` in basis points (default 4 bps = 0.04%)

`XyloFactory` includes admin functions:

- `setFeeRecipient(address)` – update fee recipient (used by router rescue)
- `setSwapFee(uint256)` – update global swap fee (max 100 bps)
- `setProtocolFee(uint256)` – update protocol fee share of swap fee (max 100%)
- `setDefaultA(uint256)` – adjust default amplification parameter within safe bounds

The `protocolFee` parameter exists in the factory interface but is **not wired into the `XyloStablePool` fee logic**; fees currently accumulate inside the pool, benefiting LPs only.

### 4.2 StableSwap Invariant and Swap Execution

`XyloStablePool` implements a two-coin StableSwap invariant similar to Curve’s model. At a high level:

- Reserves are normalized to 18 decimals via precision multipliers
- `_getD(xp, A)` computes invariant D for the normalized balances `xp`
- `_getY(i, j, x, xp)` computes the new balance of token j when token i’s normalized balance is set to x, holding D constant

`calculateSwap(tokenIn, tokenOut, amountIn)` proceeds as follows:

1. Determine indices `(i, j)` for `tokenIn` and `tokenOut`.
2. Compute normalized balances `xp[0] = reserve0 * precisionMultiplier0`, `xp[1] = reserve1 * precisionMultiplier1`.
3. Let `x = xp[i] + amountIn * precisionMultiplier[i]` and solve for `y = _getY(i, j, x, xp)`.
4. Compute `dy = xp[j] - y - 1` and fee `fee = dy * swapFee / FEE_DENOMINATOR`.
5. De-normalize: `amountOut = (dy - fee) / precisionMultiplier[j]`.

The state-changing `swap` function:

- Transfers `amountIn` from `msg.sender` to the pool
- Recomputes `amountOut` as above and enforces `amountOut >= minAmountOut`
- Updates reserves in real token units
- Transfers `amountOut` to the recipient
- Emits a `Swap` event
- Uses a reentrancy guard and deadline modifier

### 4.3 Liquidity Provision and LP Tokens

LP tokens are provided by `XyloERC20`:

- 18 decimals
- EIP-2612 `permit` support (`DOMAIN_SEPARATOR`, `nonces`, `permit`)

`addLiquidity(amounts[2], minLpTokens, to, deadline)`:

- Computes current D (`d0`) from normalized reserves
- Transfers input amounts of `token0` and `token1` from caller
- Computes new D (`d1`) after adding liquidity
- If `totalSupply == 0`, mints `d1` LP tokens; otherwise mints `((d1 - d0) * totalSupply) / d0`
- Enforces `lpTokens >= minLpTokens`
- Updates reserves and mints LP tokens to `to`

`removeLiquidity(lpTokenAmount, minAmounts[2], to, deadline)`:

- Computes pro-rata outputs: `amount0 = reserve0 * lp / totalSupply`, `amount1 = reserve1 * lp / totalSupply`
- Enforces `amount0 >= minAmounts[0]` and `amount1 >= minAmounts[1]`
- Burns LP from `msg.sender`
- Updates reserves and transfers tokens to `to`

`removeLiquidityOne(lpTokenAmount, tokenIndex, minAmount, to, deadline)`:

- Using `_calculateRemoveLiquidityOne`, computes the single-token output and an internal fee
- Burns LP, updates the selected reserve, transfers the corresponding token to `to`

### 4.4 Router Functions and UX

`XyloRouter` provides a Uniswap-style interface:

- View functions:
  - `getAmountOut(tokenIn, tokenOut, amountIn)`
  - `getAmountsOut(amountIn, path[])`
  - `quote(tokenIn, tokenOut, amountIn)` returning `amountOut` and a derived price impact

- Swap functions:
  - `swap(SwapParams)` – primary single-hop swap used by the frontend
  - `swapExactTokensForTokens(amountIn, minOut, path, to, deadline)` – multi-hop
  - `swapTokensForExactTokens(amountOut, maxIn, path, to, deadline)` – multi-hop with approximate back-calculation
  - `swapWithPermit(SwapParams, permitDeadline, v, r, s)` – combines permit and swap

- Liquidity functions:
  - `addLiquidity(AddLiquidityParams)` – wraps pool `addLiquidity` with token ordering
  - `removeLiquidity(RemoveLiquidityParams)` – wraps pro-rata removal
  - `removeLiquidityOne(tokenA, tokenB, lpAmount, tokenIndex, minAmount, to, deadline)` – wraps one-sided removal

The router contract is used by the `SwapWidget` to:

- Query `getAmountOut` for live quotes
- Submit `swap` transactions with slippage and deadline protection
- Use `approve` once (via ERC-20) and then re-use allowance across swaps, or `swapWithPermit` for gasless approvals if supported by the token.

---

## 5. XyloBridge: CCTP V2 Integration

### 5.1 Contract Mechanics

`XyloBridge` interacts with CCTP V2 contracts to execute native USDC burns and mints across chains:

- Holds immutable addresses:
  - `tokenMessenger` – CCTP TokenMessengerV2 on Arc Testnet
  - `messageTransmitter` – CCTP MessageTransmitterV2 on Arc Testnet
  - `usdc` – native USDC on Arc

- Maintains:
  - `chainDomains`: mapping from chain name strings (e.g. `"ethereum"`, `"base"`) to domain IDs
  - `supportedDomains`: mapping of domain IDs to booleans
  - Aggregate stats: `totalBridgedIn`, `totalBridgedOut`, `bridgeCount`

**Bridge out** (`bridgeOut(amount, destinationDomain, recipientBytes32)`):

1. Validates non-zero amount, supported domain, and non-zero recipient.
2. Transfers USDC from caller to `XyloBridge`.
3. Approves TokenMessengerV2 to spend `amount`.
4. Calls `depositForBurn` with standard CCTP parameters (`minFinalityThreshold = 2000`, no relayer fee).
5. Updates stats and emits `BridgeInitiated`.

**Bridge by chain name** (`bridgeToChain(amount, chainName, recipient)`):

- Resolves `destinationDomain` via `chainDomains[chainName]`.
- Encodes `recipient` into `bytes32`.
- Delegates to `bridgeOut`.

**Bridge in** (`bridgeIn(message, attestation)`):

- Calls `MessageTransmitterV2.receiveMessage(message, attestation)`.
- On success, extracts an approximate amount from the message payload and increments `totalBridgedIn`.
- Emits `BridgeCompleted`.

Admin functions let the owner add/remove domains, transfer ownership, and rescue tokens.

### 5.2 Frontend Integration and User Flow

The `BridgeWidget` integrates Circle Bridge Kit in the XyloNet frontend:

- Defines a set of testnet chains (Arc Testnet, Ethereum Sepolia, Arbitrum Sepolia, Base Sepolia, Optimism Sepolia, Polygon Amoy, Avalanche Fuji).
- Uses `createAdapterFromProvider` to wrap the user’s wallet provider as a Bridge Kit adapter.
- Calls `kit.bridge({ from, to, amount, config })` with `transferSpeed: 'FAST'`, using Circle’s relayer to perform minting.
- Listens to bridge events (`approve`, `burn`, `fetchAttestation`, `mint`) and maps them to a step progress UI.
- Handles common error patterns (RPC errors, timeouts) and distinguishes between genuine failures and cases where the burn succeeded but the client could not verify the mint, in which case it records a “submitted/pending” status and instructs the user to verify their destination balance after a few minutes.

The `BRIDGE_TESTING_GUIDE.md` document matches the implemented behavior and provides concrete test procedures for Arc → Ethereum Sepolia transfers.

---

## 6. XyloVault: Yield Vault

### 6.1 Vault Design

`XyloVault` is a single-asset vault that issues fungible shares representing a pro-rata claim on the underlying stablecoin (`asset`). It follows ERC-4626 design patterns, though it is implemented directly rather than via an interface import.

State:

- `asset`: immutable ERC-20 stablecoin
- `owner`: vault owner with admin rights
- `strategy`: address reserved for external yield strategies (not yet wired in on-chain)
- Fees (bps):
  - `depositFee` (default 0)
  - `withdrawFee` (default 10 = 0.1%)
  - `performanceFee` (default 1000 = 10%)
  - Enforced upper bound: `MAX_FEE = 2000` (20%)
- `feeRecipient`: address receiving deposit/withdraw/performance fees
- `totalAssets`: tracked assets under management
- `lastHarvestTime`: timestamp of last successful harvest

### 6.2 Conversions and Previews

The vault exposes common helpers:

- `convertToShares(assets)` – uses current `totalSupply` and `totalAssets` to compute shares; if supply is 0, `shares = assets`.
- `convertToAssets(shares)` – inverse conversion.
- `previewDeposit(assets)` – calculates shares after deducting deposit fee.
- `previewWithdraw(assets)` – calculates required shares including withdraw fee.
- `previewRedeem(shares)` – calculates net assets after withdraw fee.
- `maxDeposit`, `maxWithdraw`, `maxRedeem` – basic limits per account.

### 6.3 Deposit, Withdraw, Redeem

**Deposit(assets, receiver)**:

1. Enforce non-zero `assets` and non-zero `receiver`.
2. Compute `fee = assets * depositFee / FEE_DENOMINATOR` and `assetsAfterFee = assets - fee`.
3. Compute `shares = convertToShares(assetsAfterFee)` and enforce `shares > 0`.
4. Transfer `assets` from `msg.sender` to the vault.
5. Transfer `fee` to `feeRecipient` if non-zero.
6. Update `totalAssets += assetsAfterFee`.
7. Mint `shares` to `receiver`.

**Withdraw(assets, receiver, owner)**:

1. Enforce non-zero `assets` and non-zero `receiver`.
2. Compute `shares = previewWithdraw(assets)`.
3. If `msg.sender != owner`, enforce allowance for shares and decrement it.
4. Enforce `balanceOf[owner] >= shares`.
5. Compute `fee = assets * withdrawFee / FEE_DENOMINATOR`.
6. Burn `shares` from `owner`.
7. Update `totalAssets -= (assets + fee)`.
8. Transfer `assets` to `receiver`, and `fee` to `feeRecipient`.

**Redeem(shares, receiver, owner)**:

1. Enforce non-zero `shares` and non-zero `receiver`.
2. Check allowance if `msg.sender != owner` and enforce sufficient balance.
3. Compute `assets = previewRedeem(shares)` and `grossAssets = convertToAssets(shares)`.
4. Let `fee = grossAssets - assets`.
5. Burn `shares` and set `totalAssets -= grossAssets`.
6. Transfer `assets` to `receiver` and `fee` to `feeRecipient`.

### 6.4 Harvest and Strategy

`harvest()` is called to realize profits from external strategies:

- Computes `currentBalance = asset.balanceOf(address(this))`.
- If `currentBalance > totalAssets`, treats the difference as profit.
- Takes performance fee: `fee = profit * performanceFee / FEE_DENOMINATOR` to `feeRecipient`.
- Updates `totalAssets = currentBalance - fee` and `lastHarvestTime = block.timestamp`.

As of this version, the contract itself does **not** move funds into external protocols; any yield must arrive via off-chain or strategy contracts that send additional assets to the vault.

---

## 7. PayX: USDC Social Tipping for X (Twitter)

### 7.1 PayXTipping Contract

The PayX smart contract is defined by the ABI in `frontend/src/config/abis/PayXTipping.ts` and deployed at `0xA312c3...5913` on Arc Testnet. It operates entirely in USDC (6 decimals).

Core functionality:

- `tip(string handle, uint256 amount, string message)`
  - Sends a USDC tip from caller to escrow for a given X handle.
  - Emits `TipSent(handleHash, handle, tipper, amount, fee, message, timestamp)`.

- `claimTips(string handle, address wallet, bytes32 nonce, bytes signature)`
  - Claims all pending tips for a handle to a given wallet, using an oracle-signed claim.
  - Links the handle to a wallet and emits `WalletLinked(handleHash, handle, wallet)` if necessary.
  - Emits `TipsClaimed(handleHash, handle, wallet, amount, timestamp)`.

- View functions:
  - `getPendingBalance(handle)` – total unclaimed tips for the handle
  - `getHandleInfo(handle)` – returns `HandleInfo` struct with pending balance, linked wallet, registration flag, and aggregates
  - `getTipHistory(handle, offset, limit)` – returns a window of past tips
  - `totalFeesCollected`, `platformFeeBps`, `minTipAmount` – configuration and accounting

All handle comparisons use a canonical string (normalized in off-chain code) to ensure consistent mapping.

### 7.2 PayX Frontends and API Flow

The PayX UX is implemented in two places:

1. **Embedded XyloNet PayX pages** (`frontend/src/app/payx`):

   - `/payx` – marketing page with live stats and an extension CTA.
   - `/payx/claim` – claim page where the flow is:
     1. User authenticates with X via Next.js API route `/api/payx/auth/twitter` and cookie-backed sessions.
     2. Backend stores the X handle and returns user info via `/api/payx/auth/me`.
     3. Frontend fetches tip summary via `/api/payx/tips/{handle}`.
     4. When claiming, frontend requests a claim signature from `/api/payx/claim/sign`, passing the connected wallet.
     5. Backend returns `handle`, `walletAddress`, `nonce`, `signature`.
     6. Frontend calls `claimTips(handle, wallet, nonce, signature)` on PayXTipping using wagmi.
     7. Frontend polls Arc RPC for a successful receipt and then updates UI and stats.

   - `/payx/dashboard` – creator dashboard showing handle, linked wallet, total received, total claimed, pending balance, and recent tips.

2. **Standalone PayX Web app** (`payx/apps/web`):

   - Provides a similar landing, claim, and dashboard experience with its own styling but the same contract and API backend.

The **PayX API** (`payx/apps/api`) is an Express server that:

- Manages sessions with `express-session` and stores X OAuth state.
- Exposes `/api/auth`, `/api/claim`, `/api/tips`, `/api/health` routes.
- Generates signed claims for `claimTips` using a service key (not exposed to clients).

### 7.3 Supabase Analytics and Live Stats

`frontend/src/lib/payx-supabase.ts` defines:

- `payx_users` table with `wallet_address`, `x_handle`, `total_sent`, `total_received`, `tip_count`, and timestamps.
- `payx_tips` table with `tx_hash`, `from_address`, `to_handle`, `amount`, `fee`, `message`, `timestamp`, and `block_number`.

Helper functions:

- `getOrCreatePayXUser`, `updateUserStats`, `updateRecipientStats` create and update aggregates.
- `indexTip` upserts tips tied to tx hashes and updates both sender and recipient.
- `getRecentTips(limit)` returns a simple recent tips feed.
- `getPayXStats()` computes:
  - Total volume
  - Total tips
  - Total and unique users (tippers and recipients)
  - 24h volume and tip counts
  - Average tip size

`usePayXStats` and `useRecentTips` hooks in `frontend/src/hooks/usePayXStats.ts`:

- Trigger an indexer run (`POST /api/payx/stats`) to sync new on-chain events into Supabase.
- Fetch stats from Supabase (`source=supabase`) and fall back to blockchain-based calculations if necessary.
- Periodically refresh stats and recent tips on the landing page and embedded PayX pages.

### 7.4 Chrome Extension and Twitter Bot

- **Chrome extension** (`payx/apps/extension`) injects a “Tip with PayX” button into the X UI and connects users to the PayX web app or direct on-chain flows.

- **Twitter bot** (`frontend/src/lib/twitter-bot`):
  - Uses Supabase for bot configuration (`payx_bot_config`), posts (`payx_bot_posts`), rate limits, and quotas.
  - Reads unposted tips and aggregates them into batch tweets (e.g. hourly summaries, whale batches, daily recaps, milestones).
  - Posts via Twitter API v2, respecting configured daily limits and dry-run mode.

The implementation, behavior, and safety controls (dry run, quotas, duplicate prevention) are documented in `TWITTER_BOT_IMPLEMENTATION.md` and backed by the code in `orchestrator.ts`, `filter.ts`, `formatter.ts`, and `tracker.ts`.

---

## 8. XyloNet Points System

The XyloNet Points System is an internal scoring engine that rewards genuine use of XyloNet and PayX. It does **not** mint or imply any token by itself; it is a numeric scoring infrastructure implemented in code.

### 8.1 Data Sources and Pipeline

Data sources:

- **Goldsky subgraphs** for:
  - XyloNet swaps
  - XyloVault deposits
  - PayX tips
- **Supabase** tables for users, social tasks, and points breakdown

Processing pipeline (`frontend/src/lib/points/goldsky-import.ts`):

1. Fetch all historical swaps, tips, and vault deposits in batches.
2. Compute per-wallet volumes in USD terms (using USDC units) for swaps, vault, and PayX.
3. Upsert or update user rows in Supabase with cumulative volumes and activity timestamps.
4. A recalculation process computes points per user based on:
   - Logarithmic volume points per product
   - Milestone bonuses (volume thresholds)
   - First-interaction bonuses
   - Referral tiers and referred-user bonuses
   - Quality scores and multipliers
   - Social-task completions

Cron and manual endpoints:

- `/api/points/cron` – daily recalculation via Vercel cron
- `/api/points/recalculate` – on-demand full recalculation with admin key

### 8.2 Scoring Components (As Implemented)

The scoring formulas match `POINTS_SYSTEM_DOCUMENTATION.md`:

- **Volume points**:
  - For each product (Swap, Vault, PayX), points = `floor(log2(1 + volume/baseVolume) × multiplier)`, capped per product.

- **Milestones**:
  - One-time bonuses at cumulative volume thresholds per product (Bronze, Silver, Gold, etc.).

- **First interaction bonuses**:
  - First swap, first vault deposit, and first PayX tip each grant a fixed number of points.

- **Referrals**:
  - Tiered per-successful-referral points, with diminishing increments and strict success criteria (volume, product diversity, active days).

- **Quality score & multipliers**:
  - Score 0–100 based on account age, product diversity, activity consistency, and average transaction size.
  - Score maps to multipliers from 0.5× (suspected bot) to 1.25× (premium user).

- **Social tasks**:
  - `tasks` and `task_completions` tables track social actions; only `task_type = 'social'` tasks contribute to social points.

The code and documentation are consistent; any future changes to thresholds or formulas should be reflected in both.

---

## 9. Security Model

### 9.1 Smart Contract Safeguards

Across contracts, the following safeguards are implemented (see `SECURITY.md` and source):

- **Reentrancy guards**:
  - `XyloRouter` and `XyloStablePool` use an `unlocked` flag pattern (`lock` modifier).

- **Deadline checks**:
  - `ensure(deadline)` modifiers reject expired operations.

- **Access control**:
  - `onlyOwner` on sensitive functions in `XyloFactory`, `XyloVault`, `XyloBridge`.
  - Two-step ownership transfer for `XyloFactory`.

- **Input validation**:
  - Non-zero addresses and amounts are enforced in constructors and main entrypoints.
  - Pools ensure distinct tokens and prevent duplicate pairs.

- **Safe arithmetic**:
  - Solidity 0.8.30 with built-in overflow/underflow checks.
  - Careful use of precision multipliers for token decimals.

- **CEI pattern**:
  - State-changing functions follow Checks → Effects → Interactions ordering.

### 9.2 Known Risks and Audit Status

Per `SECURITY.md`:

- The core contracts (`XyloFactory`, `XyloRouter`, `XyloStablePool`, `XyloBridge`, `XyloVault`, and PayXTipping) have **not yet undergone a professional external audit** and are deployed on **testnet only**.
- Risk considerations:
  - **StableSwap**: depeg risk, imbalanced liquidity, and sensitivity to A changes.
  - **Bridge**: dependency on Circle’s attestation service and correct domain configuration.
  - **Vault**: strategy risk once external strategies are integrated, and emergency withdraw powers held by owner.

The repository explicitly warns users not to use real funds and to treat the system as experimental.

---

## 10. Current Status vs Future Roadmap

### 10.1 Implemented and Live (Testnet)

As of January 2026, the following are implemented and wired end-to-end on Arc Testnet:

- StableSwap AMM with XyloFactory/XyloStablePool/XyloRouter and USDC/EURC/USYC pools
- XyloBridge with CCTP V2 and Circle Bridge Kit UI, tested primarily for Arc → Ethereum Sepolia
- XyloVault with ERC-20 share accounting and fee logic
- PayXTipping contract, PayX web apps, PayX API backend, Supabase-based stats, and claim flows
- PayX Chrome extension
- Points system based on Goldsky and Supabase, with production-ready scoring logic
- PayX Twitter bot with quotas, dry-run, logging, and monitoring

### 10.2 Proposed Enhancements (Not Yet On-Chain)

`XYLONET_ENHANCEMENT_ROADMAP.md` and `XYLONET_FUTURE_VISION.md` describe future work, including:

- StableFX RFQ integration
- Account abstraction and gasless transactions
- Permit2-based router functions
- More sophisticated vault strategies
- Governance and token mechanisms

These items are **not yet present in deployed contracts** and should be treated as roadmap rather than current behavior.

---

## 11. Conclusion

XyloNet provides a coherent, stablecoin-native DeFi and social tipping stack on Arc Testnet:

- A StableSwap AMM for efficient stablecoin trading
- A CCTP V2 bridge with a user-friendly Circle Bridge Kit integration
- A vault with ERC-4626-style share accounting and configurable fees
- PayX, a fully integrated social tipping system for X, spanning smart contracts, web apps, APIs, analytics, and automation
- A points system that measures and rewards usage across products and social channels

This whitepaper focuses strictly on the behavior of the current codebase and deployed contracts, leaving tokenomics and governance for future versions once their implementations exist on-chain and in code.
