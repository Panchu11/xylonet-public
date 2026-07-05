# XyloNet - Stablecoin SuperExchange on Arc Network

> For complete documentation, see [XYLONET_PROJECT.md](./XYLONET_PROJECT.md)

## Quick Summary

**XyloNet** is a next-generation DEX + Cross-Chain Bridge + Yield Vault purpose-built for Arc Network's stablecoin-native architecture.

| Component | Description | Status |
|-----------|-------------|--------|
| **XyloSwap** | StableSwap AMM for stablecoin trading | ✅ Live |
| **XyloBridge** | Circle CCTP V2 cross-chain bridge | ✅ Live |
| **XyloVault** | ERC-4626 yield aggregation vault | ✅ Live |

## Core Value Proposition

- **Instant Settlement**: <350ms deterministic finality
- **Predictable Costs**: ~$0.01 per transaction in USDC
- **Native Cross-Chain**: Circle CCTP V2 with auto-delivery
- **Real Yield**: USYC Treasury-backed yields
- **Mobile First**: Fully responsive design

## Key Features

### XyloSwap - Stablecoin DEX
- StableSwap curve (A=200) for minimal slippage
- USDC ↔ EURC ↔ USYC trading pairs
- 0.04% swap fee (4 basis points)
- Real-time price quotes

### XyloBridge - Cross-Chain Bridge  
- Native CCTP V2 integration (no wrapped tokens)
- Circle Bridge Kit for automatic delivery
- 7 chains: Ethereum, Arbitrum, Base, Optimism, Polygon, Avalanche, Arc
- Fast transfer mode (~30 seconds)

### XyloVault - Yield Aggregation
- ERC-4626 compliant vault
- USDC deposits for yield generation
- Auto-compounding strategies
- Real-time APY tracking (~4-5%)

### XyloPools - Liquidity Provision
- Concentrated liquidity positions
- LP tokens for pool share
- Earn 0.04% of all trades
- Real-time analytics

## Deployed Contracts (Arc Testnet)

| Contract | Address | Explorer |
|----------|---------|----------|
| XyloFactory | `0x60EDeFB094B84BBC6430cc130B358A43Ba1979e2` | [View](https://testnet.arcscan.app/address/0x60EDeFB094B84BBC6430cc130B358A43Ba1979e2) |
| XyloRouter | `0x73742278c31a76dBb0D2587d03ef92E6E2141023` | [View](https://testnet.arcscan.app/address/0x73742278c31a76dBb0D2587d03ef92E6E2141023) |
| XyloBridge | `0xf7Df65Ce418E938ee8d9a0A0d227A43441fe4641` | [View](https://testnet.arcscan.app/address/0xf7Df65Ce418E938ee8d9a0A0d227A43441fe4641) |
| XyloVault | `0x240Eb85458CD41361bd8C3773253a1D78054f747` | [View](https://testnet.arcscan.app/address/0x240Eb85458CD41361bd8C3773253a1D78054f747) |
| USDC-EURC Pool | `0x3DF3966F5138143dce7a9cFDdC2c0310ce083BB1` | [View](https://testnet.arcscan.app/address/0x3DF3966F5138143dce7a9cFDdC2c0310ce083BB1) |
| USDC-USYC Pool | `0x8296cC7477A9CD12cF632042fDDc2aB89151bb61` | [View](https://testnet.arcscan.app/address/0x8296cC7477A9CD12cF632042fDDc2aB89151bb61) |

## Arc Network Native Contracts

| Contract | Address |
|----------|---------|
| USDC (Native) | `0x3600000000000000000000000000000000000000` |
| EURC | `0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a` |
| USYC | `0xe9185F0c5F296Ed1797AaE4238D26CCaBEadb86C` |
| TokenMessengerV2 | `0x8FE6B999Dc680CcFDD5Bf7EB0974218be2542DAA` |
| MessageTransmitterV2 | `0xE737e5cEBEEBa77EFE34D4aa090756590b1CE275` |

## Technical Stack

| Layer | Technologies |
|-------|-------------|
| **Contracts** | Solidity 0.8.30, Hardhat, Curve StableSwap |
| **Frontend** | Next.js 16, TypeScript, Tailwind CSS v4 |
| **Web3** | wagmi v2, viem, RainbowKit |
| **Bridge** | Circle Bridge Kit, CCTP V2 |
| **Network** | Arc Testnet (Chain ID: 5042002) |

## Supported Bridge Chains

| Chain | Domain ID | Network |
|-------|-----------|---------|
| Ethereum Sepolia | 0 | Testnet |
| Avalanche Fuji | 1 | Testnet |
| Optimism Sepolia | 2 | Testnet |
| Arbitrum Sepolia | 3 | Testnet |
| Base Sepolia | 6 | Testnet |
| Polygon Amoy | 7 | Testnet |
| Arc Testnet | 26 | Testnet |

## Arc Builders Fund Alignment

| Vertical | XyloNet Implementation |
|----------|------------------------|
| **Always-on Markets** | 24/7 DEX with instant settlement |
| **Onchain FX** | Multi-stablecoin swaps (USDC/EURC/USYC) |
| **Offchain Assets** | USYC yield integration |
| **Cross-border Payments** | CCTP V2 bridge for global transfers |

## Quick Start

```bash
# Clone the repo
git clone https://github.com/Panchu11/XyloNet.git
cd XyloNet

# Install frontend dependencies
cd frontend
npm install

# Start development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the app.

## Documentation

| Document | Description |
|----------|-------------|
| [XYLONET_PROJECT.md](./XYLONET_PROJECT.md) | **Complete project documentation** |
| [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md) | Development roadmap |
| [README.md](./README.md) | Quick start guide |
| [contracts/README.md](./contracts/README.md) | Smart contract docs |
| [SECURITY.md](./SECURITY.md) | Security considerations |
| [CONTRIBUTING.md](./CONTRIBUTING.md) | Contribution guidelines |

## Links

| Resource | URL |
|----------|-----|
| GitHub | https://github.com/Panchu11/XyloNet |
| X (Twitter) | https://x.com/Xylonet_ |
| Arc Docs | https://docs.arc.network |
| Arc Explorer | https://testnet.arcscan.app |
| Circle Faucet | https://faucet.circle.com |
| Arc Builders Fund | https://www.circle.com/blog/introducing-the-arc-builders-fund |

---

<p align="center">
  Built with ❤️ by ForgeLabs for the Arc Network ecosystem
</p>
