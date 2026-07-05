# XyloNet Frontend

## Overview

The XyloNet frontend is the user-facing web application for the XyloNet DeFi protocol. It provides a complete interface for swapping stablecoins, bridging USDC across chains, providing liquidity, depositing into yield vaults, claiming PayX tips, exploring protocol analytics, and reading documentation. The application is built as a modern Next.js app, optimized for the Arc ecosystem (both mainnet and testnet), and integrates deeply with onchain wallets, Circle's AppKit, RainbowKit, and real-time data sources.

The frontend consumes onchain data through a hybrid architecture that combines Envio GraphQL indexing, direct RPC calls via viem/wagmi, and PayX-specific data from Supabase. This design delivers fast, paginated analytics without sacrificing trustlessness: aggregate protocol metrics come from the indexer, while wallet-specific balances and approvals are read directly from Arc nodes.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16.1 |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 4 |
| Web3 Connectivity | wagmi v2.19, viem v2.47 |
| Wallet Connection | RainbowKit v2.2, Circle AppKit v1.6 |
| Data Fetching | TanStack Query v5 |
| Charts | recharts v3 |
| Indexer | Envio GraphQL |
| Backend / PayX | Supabase |
| Deployment | Vercel |

---

## Project Structure

```
frontend/
├── src/
│   ├── app/                    # Next.js App Router pages
│   ├── components/             # Reusable UI components
│   ├── lib/
│   │   ├── envio.ts            # Envio GraphQL client and queries
│   │   ├── onchain.ts          # Onchain RPC helpers
│   │   ├── payx-supabase.ts    # PayX Supabase integration
│   │   ├── points/             # Points calculation engine
│   │   │   ├── index.ts
│   │   │   ├── constants.ts
│   │   │   ├── liquidity.ts
│   │   │   ├── swap.ts
│   │   │   ├── vault.ts
│   │   │   ├── bridge.ts
│   │   │   ├── referral.ts
│   │   │   ├── streak.ts
│   │   │   └── types.ts
│   │   └── twitter-bot/        # Twitter bot automation
│   │       ├── index.ts
│   │       ├── client.ts
│   │       ├── scheduler.ts
│   │       ├── templates.ts
│   │       ├── analytics.ts
│   │       ├── webhook.ts
│   │       ├── types.ts
│   │       └── utils.ts
│   ├── hooks/                  # Custom React hooks
│   ├── providers/              # Context and wagmi/RainbowKit providers
│   └── styles/                 # Global and Tailwind styles
├── public/                     # Static assets
├── scripts/                    # Build and utility scripts
├── sql/                        # Raw SQL queries and analytics views
├── docs/                       # Static documentation
├── pitch-deck/                 # Pitch deck assets
├── next.config.ts              # Next.js configuration
├── tailwind.config.ts          # Tailwind configuration
├── tsconfig.json               # TypeScript configuration
└── vercel.json                 # Vercel deployment configuration
```

---

## Getting Started

### Prerequisites

- Node.js 20 or later
- npm or pnpm
- An Arc-compatible wallet (e.g., MetaMask configured for Arc Mainnet / Testnet)
- Access to a deployed XyloNet indexer endpoint
- (Optional) Supabase credentials for PayX features

### Installation

```bash
cd frontend
npm install
```

### Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

### Build for Production

```bash
npm run build
```

### Lint

```bash
npm run lint
```

---

## Environment Variables

Create a `.env.local` file in `frontend/` with the following variables:

```env
# Arc RPC (Mainnet + Testnet)
NEXT_PUBLIC_ARC_RPC_URL=https://rpc.arc.network
NEXT_PUBLIC_ARC_TESTNET_RPC_URL=https://rpc.testnet.arc.network

# Contract addresses (Arc Mainnet / Testnet)
NEXT_PUBLIC_FACTORY_ADDRESS=0x60EDeFB094B84BBC6430cc130B358A43Ba1979e2
NEXT_PUBLIC_ROUTER_ADDRESS=0x73742278c31a76dBb0D2587d03ef92E6E2141023
NEXT_PUBLIC_BRIDGE_ADDRESS=0xf7Df65Ce418E938ee8d9a0A0d227A43441fe4641
NEXT_PUBLIC_VAULT_ADDRESS=0x240Eb85458CD41361bd8C3773253a1D78054f747

# Chain IDs (hex)
NEXT_PUBLIC_ARC_MAINNET_CHAIN_ID=0x7C49597c5C39c5278D1D37F2F5C35D1e8bD4faC2
NEXT_PUBLIC_ARC_TESTNET_CHAIN_ID=0x7D15246174094259783232CE429D94A005F7D2B1

# Indexer
NEXT_PUBLIC_ENVIO_URL=https://your-envio-indexer.hasura.app/v1/graphql

# WalletConnect (for RainbowKit)
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id

# Circle AppKit
NEXT_PUBLIC_CIRCLE_APP_ID=your_circle_app_id

# Supabase (PayX)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Optional: analytics, monitoring, feature flags
NEXT_PUBLIC_POSTHOG_KEY=your_posthog_key
NEXT_PUBLIC_ENABLE_PAYX=true
```

Variables prefixed with `NEXT_PUBLIC_` are exposed to the browser. Server-only secrets should not use this prefix.

---

## Available Scripts

| Script | Command | Purpose |
|--------|---------|---------|
| Dev server | `npm run dev` | Start local development server with hot reload. |
| Build | `npm run build` | Create an optimized production build. |
| Start | `npm run start` | Serve the production build locally. |
| Lint | `npm run lint` | Run ESLint across the codebase. |
| Type check | `npm run typecheck` | Run TypeScript compiler in no-emit mode. |

---

## Pages and Routes

| Route | Description |
|-------|-------------|
| `/` | Landing page with Hero, Features, PayX Showcase, Campaign, Assets, and Arc Integration sections. |
| `/swap` | Stablecoin swap interface using `XyloRouter`. |
| `/bridge` | Cross-chain USDC bridge powered by Circle Bridge Kit UI and `XyloBridge`. |
| `/pools` | Liquidity pool analytics, pool listings, and liquidity provision. |
| `/vault` | Yield vault deposit and withdrawal interface. |
| `/history` | Wallet-specific transaction history. |
| `/payx` | PayX marketing and protocol stats. |
| `/payx/claim` | X OAuth → Wallet → Claim tips flow. |
| `/payx/dashboard` | Creator dashboard for pending and claimed tips. |
| `/analytics` | Protocol analytics: volume, users, TVL, bridge stats. |
| `/points` | Points and rewards dashboard. |
| `/faucet` | Arc testnet USDC/EURC faucet. |
| `/docs` | Documentation hub (14 pages). |
| `/xylofacilitator` | XyloFacilitator product page. |

---

## Key Libraries

### `src/lib/envio.ts`

The Envio GraphQL client. It exposes typed queries for:

- `Swaps` — historical and real-time swap events.
- `Pools` — pool metadata, reserves, and volume.
- `DailyVolume` — aggregate daily volume per pool and protocol-wide.
- `ProtocolStats` — high-level metrics such as total volume, total users, and TVL.

Example usage:

```ts
import { getProtocolStats, getPoolSwaps } from "@/lib/envio";

const stats = await getProtocolStats();
const swaps = await getPoolSwaps(poolAddress, { limit: 100 });
```

### `src/lib/onchain.ts`

Onchain RPC helpers built on viem. It reads:

- Wallet token balances and allowances.
- Pool reserves and amplification parameters.
- Vault share/asset conversions and TVL.
- Bridge contract stats.

These functions are used to complement indexer data with live wallet and contract state.

### `src/lib/payx-supabase.ts`

Supabase integration for PayX. Handles:

- Creator profile lookup by X handle.
- Tip claim status and signature storage.
- OAuth session association.

### `src/lib/points/`

A points calculation engine composed of nine modules:

- `index.ts` — entry point and aggregate scoring.
- `constants.ts` — point weights and thresholds.
- `liquidity.ts` — liquidity provision points.
- `swap.ts` — swap volume points.
- `vault.ts` — vault deposit points.
- `bridge.ts` — bridge usage points.
- `referral.ts` — referral rewards.
- `streak.ts` — daily/weekly streak multipliers.
- `types.ts` — shared type definitions.

### `src/lib/twitter-bot/`

Twitter bot automation with eight modules:

- `index.ts` — orchestration.
- `client.ts` — X API client wrapper.
- `scheduler.ts` — cron-style scheduling.
- `templates.ts` — post templates.
- `analytics.ts` — engagement analytics.
- `webhook.ts` — webhook listener.
- `types.ts` — shared types.
- `utils.ts` — helpers.

---

## Data Architecture

The frontend uses a hybrid data model:

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Envio Indexer │     │   Arc RPC Nodes │     │    Supabase     │
│   (GraphQL)     │     │   (viem/wagmi)  │     │   (PostgreSQL)  │
└────────┬────────┘     └────────┬────────┘     └────────┬────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────▼─────────────┐
                    │      Next.js Frontend     │
                    │   (TanStack Query cache)  │
                    └───────────────────────────┘
```

- **Envio** provides indexed, aggregate, and historical data (volume, TVL, users, swap history) with efficient pagination and no frontend approximation for zero-pagination metrics.
- **Arc RPC nodes** provide live wallet balances, allowances, reserves, and vault conversions.
- **Supabase** stores offchain PayX data such as handle mappings, claim signatures, and creator dashboards.

This separation ensures that analytics are fast and scalable while wallet-critical state remains sourced directly from the chain.

---

## Deployment

### Vercel

The recommended deployment target is Vercel.

1. Push the repository to GitHub.
2. Import the project into Vercel.
3. Configure environment variables in the Vercel dashboard.
4. Deploy from the production branch.

For preview deployments, Vercel will automatically create unique URLs for each pull request.

### Configuration

- `next.config.ts` — Next.js settings, image domains, rewrites.
- `vercel.json` — Vercel-specific routing, headers, and cron jobs if applicable.
- `eslint.config.mjs` — Lint rules.

---

## Development Notes

- Prefer server components where possible to reduce client-side bundle size.
- Use TanStack Query for client-side data fetching with appropriate stale times.
- Keep contract addresses in environment variables for easy network switching.
- Always guard wallet-dependent pages behind connection state to avoid unnecessary RPC calls.
- The points engine runs entirely in the browser; ensure score calculations are deterministic and reproducible.

---

## License

See the repository root `LICENSE` file.
