# XyloNet Tokenomics: $XYLO
**Version 1.0 | April 2026 | ForgeLabs**

---

## 1. Token Overview

| Parameter | Value |
|-----------|-------|
| **Token Name** | Xylo |
| **Ticker** | $XYLO |
| **Total Supply** | 1,000,000,000 (1 Billion) |
| **Supply Model** | Fixed cap + deflationary burn |
| **Token Standard** | ERC-20 (18 decimals) |
| **Native Chain** | Arc Network |
| **Bridgeable** | Yes, via CCTP V2 (Ethereum, Base, Arbitrum, Optimism, Polygon, Avalanche) |

### Supply Philosophy

$XYLO has a **hard-capped supply of 1 billion tokens**. No additional tokens can ever be minted. The contract has no mint function beyond the initial genesis allocation. A buyback-and-burn mechanism funded by 20% of protocol revenue creates sustained deflationary pressure, with the target of becoming net-deflationary by Year 3-5 as emissions taper.

$XYLO is **not a gas token** — Arc Network uses native USDC for gas. This means every unit of $XYLO demand is driven by genuine protocol utility (governance, revenue share, boosted rewards), not transaction necessity.

---

## 2. Token Allocation

| Category | % | Tokens | Cliff | Vesting | Purpose |
|----------|---|--------|-------|---------|---------|
| **Community & Ecosystem** | 35% | 350,000,000 | None | 5-year emission schedule | Liquidity mining, retroactive airdrop, gauge emissions, growth campaigns, developer grants |
| **Treasury & DAO** | 20% | 200,000,000 | None | Governance-controlled | Protocol-owned liquidity, ecosystem grants, strategic reserves, insurance fund, operations |
| **Core Contributors (Team)** | 18% | 180,000,000 | 12 months | 36 months linear (4yr total) | ForgeLabs team, future hires, contributor retention |
| **Investors** | 14% | 140,000,000 | 6 months | 18-24 months linear | Seed (8%), Strategic (6%) — capital for development, audits, market-making |
| **Liquidity Provisioning** | 8% | 80,000,000 | None | Deployed at TGE | Initial DEX liquidity, CEX listings, protocol-owned XYLO/USDC pair, market stability |
| **Advisors & Strategic Partners** | 5% | 50,000,000 | 6 months | 30 months linear (3yr total) | Strategic advisors, Arc Network partnerships, Circle ecosystem alignment |

**Community-First Ratio:** 63% of all tokens (Community 35% + Treasury 20% + Liquidity 8%) are allocated to community-controlled or community-benefiting categories. Only 37% goes to insiders, all subject to meaningful vesting.

---

## 3. Vesting & Unlock Schedule

### Vesting Parameters

| Category | TGE Unlock | Cliff | Linear Vest | Full Unlock |
|----------|-----------|-------|-------------|-------------|
| Community & Ecosystem | 3% (airdrop) | None | Emission schedule (5 years) | Month 60 |
| Treasury & DAO | 0% | None | Governance-controlled | Governance vote |
| Core Contributors | 0% | 12 months | 36 months linear | Month 48 |
| Investors (Seed) | 0% | 6 months | 24 months linear | Month 30 |
| Investors (Strategic) | 0% | 6 months | 18 months linear | Month 24 |
| Liquidity Provisioning | 100% | None | Deployed immediately | TGE |
| Advisors & Partners | 0% | 6 months | 30 months linear | Month 36 |

### Cumulative Unlock Timeline

| Milestone | Circulating Supply | % of Total |
|-----------|-------------------|------------|
| TGE | ~110,000,000 | 11% |
| Month 6 | ~170,000,000 | 17% |
| Year 1 | ~290,000,000 | 29% |
| Year 2 | ~520,000,000 | 52% |
| Year 3 | ~740,000,000 | 74% |
| Year 4 | ~900,000,000 | 90% |
| Year 5 | 1,000,000,000 | 100% |

**Anti-Dump Design:** At TGE, only ~11% of tokens are circulating. Maximum monthly insider unlock never exceeds ~2.3% of total supply.

---

## 4. Token Utility: The veXYLO Model

$XYLO employs a **vote-escrow (ve) model** inspired by Curve's veCRV, adapted for XyloNet's multi-product stablecoin ecosystem.

### How It Works

1. **Lock:** Users lock $XYLO for 1 week to 4 years
2. **Receive veXYLO:** `veXYLO = XYLO locked × (lock_time_in_years / 4)`
3. **Decay:** veXYLO balance decays linearly to 0 as the lock expires
4. **Re-lock:** Users can extend locks at any time to maintain or increase veXYLO

### veXYLO Benefits

| Benefit | Description |
|---------|-------------|
| **Revenue Share** | 80% of all protocol fees distributed weekly in USDC, pro-rata to veXYLO balance |
| **Boosted LP Rewards** | Up to 2.5x multiplier on XYLO emission rewards for LPs |
| **Gauge Voting Power** | Vote to direct weekly XYLO emissions to specific pools and products |
| **Governance Rights** | Create and vote on proposals for fee parameters, treasury, upgrades |
| **PayX Premium** | Reduced PayX fees (0.5% vs 1%), creator verification badges, priority claims |
| **Prediction Market Access** | Create prediction markets by staking XYLO as resolution bonds |

### Lock Tier Table

| Lock Duration | veXYLO per XYLO | Revenue Multiplier | LP Boost |
|--------------|-----------------|-------------------|----------|
| 1 Week | 0.005 | 0.005x | 1.0x |
| 3 Months | 0.0625 | 0.0625x | 1.15x |
| 6 Months | 0.125 | 0.125x | 1.35x |
| 1 Year | 0.25 | 0.25x | 1.65x |
| 2 Years | 0.50 | 0.50x | 2.0x |
| **4 Years (Max)** | **1.00** | **1.00x** | **2.5x** |

### Demand Drivers

1. **Protocol Revenue Share** — Real yield in USDC, not dilutive token rewards
2. **LP Reward Boost** — Without veXYLO, LPs earn base rate only; with it, up to 2.5x
3. **Gauge Voting Power** — Projects seeking deep liquidity must acquire and lock XYLO (Gauge Wars)
4. **PayX Premium Features** — Reduced fees and creator verification for veXYLO holders
5. **Prediction Market Bonds** — Market creation requires XYLO staking
6. **AI Agent API Access** — Premium API tiers require XYLO staking

---

## 5. Emissions & Incentive Schedule

### Community Emission Curve (350M over 5 Years)

| Year | % of Community Pool | Tokens Emitted | Weekly Rate |
|------|--------------------| ---------------|-------------|
| Year 1 | 30% | 105,000,000 | ~2,019,231 |
| Year 2 | 25% | 87,500,000 | ~1,682,692 |
| Year 3 | 20% | 70,000,000 | ~1,346,154 |
| Year 4 | 15% | 52,500,000 | ~1,009,615 |
| Year 5 | 10% | 35,000,000 | ~673,077 |

### Default Emission Weights (Adjustable via Gauge Voting)

| Product | Weight | Mechanism |
|---------|--------|-----------|
| XyloSwap LP Incentives | 55% | Distributed to LPs proportional to share; boosted by veXYLO |
| XyloVault Depositors | 20% | XYLO rewards proportional to USDC deposited |
| PayX Ecosystem | 10% | Tipping rewards, creator onboarding bonuses, milestone achievements |
| XyloBridge Users | 5% | XYLO rewards for bridge volume to Arc |
| Governance Reserve | 10% | Unallocated; governance can redirect |

### Retroactive Airdrop (3% at TGE)

30,000,000 XYLO distributed to pre-TGE users based on XyloNet Points System:

| Tier | Points Threshold | Allocation per Wallet |
|------|-----------------|----------------------|
| Diamond | 2,000+ | 5,000 XYLO |
| Platinum | 1,000 – 1,999 | 2,500 XYLO |
| Gold | 500 – 999 | 1,000 XYLO |
| Silver | 200 – 499 | 400 XYLO |
| Bronze | 50 – 199 | 150 XYLO |

Unclaimed tokens after 90 days revert to Community & Ecosystem pool. Points quality score system provides Sybil resistance.

---

## 6. Value Accrual Mechanisms

### Fee Sources

| Product | Fee Rate | Split |
|---------|----------|-------|
| XyloSwap | 0.04% (4 bps) per swap | 50% to LPs, 50% to Protocol |
| XyloVault | 10% performance fee on profits | 100% to Protocol |
| XyloBridge | $0.50 flat per bridge | 100% to Protocol |
| PayX | 1% platform fee on tips | 100% to Protocol |
| Prediction Markets | 2% settlement fee | 100% to Protocol |

### Protocol Revenue Distribution

All protocol-captured fees are routed through an on-chain Revenue Splitter contract:

- **80% → veXYLO Holders**: Distributed weekly in USDC, pro-rata to veXYLO balance
- **20% → Buyback & Burn**: Autonomous TWAP contract buys XYLO from market and burns it

### Burn Mechanism

1. Revenue Splitter sends 20% of USDC fees to Buyback Contract
2. Contract executes time-weighted average price (TWAP) purchases from XYLO/USDC pool
3. Purchased XYLO is sent to the zero address (permanent burn)
4. Burns are logged on-chain and displayed on a public dashboard

**Deflationary Trajectory:** As emissions taper (30% → 10% over 5 years) and protocol revenue grows, the burn rate overtakes emission rate, making XYLO net-deflationary.

---

## 7. Governance Model

### Progressive Decentralization

| Phase | Timeline | Structure |
|-------|----------|-----------|
| **Phase A: Launch** | TGE to Month 6 | 3-of-5 team multisig + advisory council. Snapshot signal voting. |
| **Phase B: Hybrid** | Month 6 to Month 18 | On-chain veXYLO governance + team veto (security-critical only). Veto sunsets after 12 months. |
| **Phase C: Full DAO** | Month 18+ | veXYLO sovereign governance. Elected Security Council retains emergency pause only. |

### Governance Parameters

| Parameter | Value |
|-----------|-------|
| Proposal Threshold | 100,000 veXYLO |
| Quorum | 4% of total veXYLO supply |
| Voting Period | 7 days |
| Timelock Delay | 48 hours |
| Vote Delegation | Supported |

### Governable Parameters

- Fee rates (swap, vault, bridge, PayX, prediction markets)
- Emission gauge weights and new gauge creation
- Treasury deployment (grants, POL, investments, insurance)
- Protocol upgrades and new product launches
- New asset integrations and chain expansion
- Revenue split ratios and burn parameters

---

## 8. Economic Sustainability

### Anti-Inflation Strategies

| Strategy | Mechanism |
|----------|-----------|
| **Fixed Supply Cap** | Hard-coded 1B maximum. No minting function. |
| **Declining Emissions** | 30% → 25% → 20% → 15% → 10% annual community pool emission |
| **Buyback & Burn** | 20% of protocol revenue permanently removes supply |
| **veXYLO Locking** | Rational actors lock 1-4 years for maximum benefits (target: 40-60% locked) |
| **Staking Bonds** | Prediction markets and premium APIs require XYLO deposits |

### Token Velocity Control

1. **Lock Incentives** — Maximum benefits require 4-year locks
2. **Gauge Wars** — Protocols competing for XyloNet liquidity accumulate XYLO long-term
3. **Real USDC Yield** — Holders earn USDC, don't need to sell XYLO to realize gains
4. **Progressive Utility** — New products continuously add demand drivers

---

## 9. The XyloNet Flywheel

```
Gauge Emissions → Attract Deep Liquidity
    → More Trading Volume
    → More Protocol Fees
    → More veXYLO Revenue (USDC)
    → More XYLO Buy Pressure & Locking
    → More Gauge Power
    → [Cycle Repeats]
```

The flywheel is self-reinforcing: as XyloNet captures more stablecoin trading activity on Arc Network, protocol revenue grows, which increases the yield for veXYLO holders, which increases demand for XYLO, which enables deeper liquidity incentives, which attracts more trading volume.

---

## 10. $XYLO Integration Across Products

| Product | $XYLO Role |
|---------|-----------|
| **XyloSwap** | LPs earn XYLO emissions (boosted by veXYLO). Swap fees → veXYLO holders. Gauge voting directs emissions. |
| **XyloBridge** | Bridge fees → veXYLO holders. Bridge users earn XYLO for bringing liquidity to Arc. |
| **XyloVault** | Depositors earn XYLO alongside USDC yield. Performance fees → veXYLO holders. |
| **PayX** | veXYLO holders get 0.5% fees (vs 1%), verification badges, priority claims. Fees → veXYLO. |
| **Prediction Markets** | Market creators stake XYLO bonds. Settlement fees → veXYLO holders. |
| **AI Agent Commerce** | Premium API access requires XYLO staking. Agent fees → veXYLO holders. |

---

## 11. Risk Factors

| Risk | Severity | Mitigation |
|------|----------|------------|
| Smart Contract Vulnerability | High | Third-party audit, Immunefi bug bounty, timelock, emergency pause |
| Low Protocol Revenue | Medium | Revenue share is from real fees, not inflation; treasury provides runway |
| Arc Network Dependency | Medium | XYLO bridgeable via CCTP V2; governance can vote multi-chain deployment |
| Regulatory Uncertainty | Medium | Governance token with utility, not security; legal counsel pre-TGE |
| Governance Capture | Low | veXYLO time-weighted voting; timelock exit window; Security Council |
| Emission Sell Pressure | Low | Declining emissions, lock incentives, USDC yield, buyback & burn |

---

## 12. Comparative Analysis

| Feature | XyloNet ($XYLO) | Curve (CRV) | Uniswap (UNI) | Aave (AAVE) |
|---------|-----------------|-------------|---------------|-------------|
| Supply Model | Fixed 1B + burn | Inflationary (3B max) | Fixed 1B | Fixed 16M |
| Value Accrual | veToken + fee share + burn | veToken + fee share | Governance only (fee switch pending) | Safety module + fee share |
| Lock Model | veXYLO (1wk-4yr) | veCRV (1wk-4yr) | None | Staking (cooldown) |
| Revenue Distribution | 80% veXYLO / 20% burn | 50% veCRV / 50% LPs | N/A (proposed) | Staker rewards |
| LP Boost | Up to 2.5x | Up to 2.5x | None | N/A |
| Gauge Voting | Yes | Yes | No | No |
| Governance | Progressive DAO | DAO | Governance | Governance |

---

## Summary

$XYLO is a **fixed-supply, vote-escrow governance token** that captures real protocol revenue from XyloNet's multi-product stablecoin ecosystem. By combining the proven veToken model with deflationary burn mechanics and genuine USDC yield, $XYLO creates a sustainable economic flywheel aligned with the long-term success of the premier stablecoin SuperExchange on Arc Network.

**Key Numbers:**
- 1B fixed supply, no minting
- 63% community-first allocation
- 5-year declining emission schedule
- 80% protocol revenue to veXYLO holders (in USDC)
- 20% protocol revenue to buyback & burn
- 4-year maximum lock for full benefits
- Progressive DAO decentralization over 18 months

---

**Disclaimer:** This document is for informational purposes only and does not constitute financial, legal, or investment advice. Token parameters are subject to change before Token Generation Event. $XYLO does not represent equity, debt, or any claim on profits. XyloNet is currently on Arc Testnet. Always do your own research.

---

*Built by ForgeLabs for the Arc Network Ecosystem*
*Contact: forgelabs@xylonet.xyz*
