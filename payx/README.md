# PayX — USDC Tipping for X (Twitter)

## Overview

PayX is a social payment layer that lets anyone send USDC tips to X (Twitter) creators by their handle, without needing the creator to pre-register a wallet. Tips are held in escrow by the `PayXTipping` smart contract until the creator authenticates with X OAuth, connects a wallet, and claims their earnings. PayX turns posts, profiles, and viral content into direct, borderless revenue streams using stablecoin infrastructure on Arc.

PayX consists of a multi-app architecture spanning an Express API, a Next.js web app, a Chrome extension, and a shared Solidity contract package.

---

## Architecture

```
payx/
├── apps/
│   ├── api/            # Express backend
│   │   ├── OAuth (X)
│   │   ├── claim signatures
│   │   └── tip queries
│   ├── web/            # Next.js web app
│   │   ├── Claim flow
│   │   └── Creator dashboard
│   └── extension/      # Chrome extension
│       └── Injected tip button on X.com
├── packages/
│   ├── contracts/      # PayXTipping.sol
│   └── config/         # Shared configuration
```

```
Tipper                    PayXTipping Contract              Creator
   │                              │                             │
   │  tipUser(handleHash, ...)   │                             │
   │────────────────────────────>│                             │
   │                             │  USDC escrowed by handle    │
   │                             │                             │
   │                             │                             │  X OAuth
   │                             │<────────────────────────────│
   │                             │                             │  connect wallet
   │                             │<────────────────────────────│
   │                             │                             │
   │                             │  signed nonce from backend  │
   │                             │────────────────────────────>│
   │                             │                             │
   │                             │  claimTips(nonce, sig)      │
   │                             │<────────────────────────────│
   │                             │                             │
   │                             │  USDC released to wallet    │
   │                             │────────────────────────────>│
```

---

## Smart Contract

**Contract:** `PayXTipping.sol`  
**Deployed (Arc Testnet):** `0xA312c384770B7b49E371DF4b7AF730EFEF465913`

The `PayXTipping` contract escrows USDC keyed by a hash of the creator's X handle.

Core functions:

| Function | Purpose |
|----------|---------|
| `tipUser(handleHash, amount, message)` | Send a USDC tip to a creator identified by their X handle hash. |
| `claimTips(nonce, signature)` | Claim accumulated tips using a backend-issued signed nonce. |
| `getHandleStats(handleHash)` | Query pending, claimed, and total tip amounts for a handle. |

Properties:
- Tips are held in contract escrow until claimed.
- Only the backend-authorized signer can issue valid claim nonces.
- Claim signatures are one-time use and bound to the claiming address.

---

## Claim Flow

1. **Tip** — A tipper sends USDC to `tipUser(handleHash, amount, message)` on Arc.
2. **Escrow** — The contract holds the USDC indexed by the recipient's X handle hash.
3. **Authenticate** — The creator visits the PayX claim page and signs in with X OAuth.
4. **Connect Wallet** — The creator connects an Arc-compatible wallet.
5. **Sign Nonce** — The backend verifies the OAuth identity, maps it to the handle hash, and issues a signed nonce.
6. **Claim** — The creator calls `claimTips(nonce, signature)` on the contract.
7. **Receive** — USDC is released to the creator's wallet.

---

## Chrome Extension

The PayX Chrome Extension injects a tip button directly into X.com posts and profile pages.

Features:
- Detects post authors and profile owners.
- Renders a "Tip" button next to native X actions.
- Opens a small popup to enter amount and message.
- Initiates an onchain tip transaction via the connected wallet.
- Works alongside the web app claim flow.

To load the extension locally:

1. Open Chrome and navigate to `chrome://extensions/`.
2. Enable "Developer mode".
3. Click "Load unpacked".
4. Select `payx/apps/extension/dist/`.

---

## API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/auth/twitter` | Initiate X OAuth login. |
| GET | `/auth/twitter/callback` | X OAuth callback handler. |
| GET | `/auth/session` | Return current session. |

### Tips

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/tips/:handle` | Get tip stats for a given X handle. |
| POST | `/tips/claim-signature` | Generate claim signature for authenticated creator. |
| GET | `/tips/leaderboard` | Top tippers and recipients. |

### Webhooks

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/webhooks/tip` | Receive and index new tip events. |

---

## Getting Started

### Prerequisites

- Node.js 20+
- npm or pnpm
- X Developer account with OAuth 2.0 credentials
- Supabase project
- Arc RPC endpoint
- Deployed `PayXTipping` contract

### Install Dependencies

From the monorepo root:

```bash
cd payx
npm install
```

### Build Packages

```bash
npm run build:packages
```

### Run API

```bash
cd apps/api
npm run dev
```

### Run Web App

```bash
cd apps/web
npm run dev
```

### Build Extension

```bash
cd apps/extension
npm run build
```

---

## Environment Variables

Create `.env` files for each app.

### API (`apps/api/.env`)

```env
PORT=4000
NODE_ENV=development

# X OAuth
TWITTER_CLIENT_ID=your_client_id
TWITTER_CLIENT_SECRET=your_client_secret
TWITTER_CALLBACK_URL=http://localhost:4000/auth/twitter/callback

# Arc
ARC_RPC_URL=https://rpc-arc-testnet.example.com
ARC_CHAIN_ID=5042002
PAYX_TIPPING_CONTRACT=0xA312c384770B7b49E371DF4b7AF730EFEF465913
USDC_CONTRACT=0x...

# Backend signer
CLAIM_SIGNER_PRIVATE_KEY=your_signer_key

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Session
SESSION_SECRET=your_session_secret
```

### Web (`apps/web/.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_PAYX_TIPPING_CONTRACT=0xA312c384770B7b49E371DF4b7AF730EFEF465913
NEXT_PUBLIC_USDC_CONTRACT=0x...
NEXT_PUBLIC_ARC_RPC_URL=https://rpc-arc-testnet.example.com
NEXT_PUBLIC_ARC_CHAIN_ID=5042002
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id
```

---

## Deployment

### API

Deploy `apps/api/` to Railway, Render, or any Node.js hosting service. Ensure environment variables are configured.

### Web

Deploy `apps/web/` to Vercel:

1. Import the repository.
2. Set the root directory to `payx/apps/web`.
3. Add environment variables.
4. Deploy.

### Extension

Package the extension from `apps/extension/dist/` and submit to the Chrome Web Store.

---

## Stats

PayX has processed:

- **$106,000+** in total tips
- **1,800+** tips sent
- **250+** active tippers
- **390+** recipients

---

## Repository Structure

```
payx/
├── apps/
│   ├── api/
│   │   ├── src/
│   │   ├── package.json
│   │   └── .env.example
│   ├── web/
│   │   ├── src/
│   │   ├── package.json
│   │   └── .env.example
│   └── extension/
│       ├── src/
│       ├── manifest.json
│       └── package.json
├── packages/
│   ├── contracts/
│   │   ├── src/PayXTipping.sol
│   │   └── package.json
│   └── config/
│       ├── src/
│       └── package.json
├── package.json
└── turbo.json
```

---

## Security Notes

- Claim signatures are issued by a backend signer and are single-use.
- OAuth sessions are bound to the creator's X identity before a claim signature is generated.
- Handle hashes are deterministic but do not expose the raw handle onchain.
- The contract escrow design ensures tips are never held by a centralized custodian.

---

## License

See the repository root `LICENSE` file.
