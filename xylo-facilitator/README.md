# XyloFacilitator — HTTP 402 Payment Infrastructure

## Overview

XyloFacilitator is a payment-rail infrastructure that enables AI agents to pay for API access using USDC over the internet. It implements the **HTTP 402 Payment Required** protocol, combining offchain authentication, a reverse proxy, and onchain settlement through EIP-3009 gasless authorizations. Agents can autonomously discover payment requirements, authorize USDC transfers, attach proof of payment to requests, and receive API responses within seconds.

The system is designed for the machine-payable web: AI agents, bots, and automated services that need reliable, low-friction, blockchain-settled access to paid APIs without credit cards, subscriptions, or manual user intervention. Settlement is supported on both Arc Mainnet (`0x7C49597c5C39c5278D1D37F2F5C35D1e8bD4faC2`) and Testnet (`0x7D15246174094259783232CE429D94A005F7D2B1`).

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         AI Agent / SDK                               │
│            (signs EIP-3009 TransferWithAuthorization)                │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
                               ▼
              ┌────────────────────────────────┐
              │      XyloFacilitator API       │
              │   (Express.js v5 + SIWE auth)  │
              └──────┬──────────────────┬──────┘
                     │                  │
         ┌───────────▼────────┐  ┌──────▼──────────┐
         │   Settlement API   │  │   Proxy Layer   │
         │  EIP-3009 verify   │  │  HTTP 402 gating│
         └───────────┬────────┘  └──────┬──────────┘
                     │                  │
         ┌───────────▼──────────────────▼──────────┐
         │         XyloFacilitator.sol             │
         │    (onchain settlement + fee split)     │
         └─────────────────────────────────────────┘
                               │
                               ▼
              ┌────────────────────────────────┐
              │         Arc Network            │
              │   (USDC settlement < 1 second) │
              └────────────────────────────────┘
```

Components:
- `backend/` — Express.js v5 API server handling auth, routes, settlement, proxying, and analytics.
- `contracts/` — `XyloFacilitator.sol` smart contract for onchain verification and fee distribution.
- `circle-setup/` — Circle wallet configuration and onboarding.
- `packages/sdk/` — Client SDK for agent integrations.

---

## API Reference

All endpoints are prefixed with `/v1`.

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/siwe/challenge` | Generate a SIWE challenge with a 5-minute nonce TTL. |
| POST | `/auth/siwe/verify` | Verify the SIWE signature and issue a 7-day JWT. |
| GET | `/auth/session` | Validate the current JWT and return session info. |

### Developer Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/developer/register` | Register a new developer account. IP rate limited to 10/hour. |
| GET | `/developer/me` | Return the authenticated developer profile. |
| POST | `/developer/routes` | Create a paywalled API route (max 20 per developer, default $0.01/call). |

### Settlement

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/facilitator/settle` | EIP-3009 gasless settlement. Restricted to authorized settler. |
| POST | `/facilitator/settle-for-developer` | Delegated settlement where a developer initiates payment on behalf of an agent. |
| POST | `/facilitator/settle-direct` | Direct `transferFrom` settlement optimized for Circle wallets. |
| GET | `/facilitator/status` | Return contract-level stats including fees collected and volume settled. |

### Proxy

| Method | Endpoint | Description |
|--------|----------|-------------|
| ALL | `/proxy/:path` | HTTP 402 payment proxy. Validates payment header and forwards requests. Rate limited to 100 req/min. |

### Agent Support

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/agent/faucet` | Distribute 10 USDC on Arc testnet. One-time per address. |

### Analytics

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/analytics/overview` | Platform-wide stats: developers, routes, settlements, volume. |

---

## Smart Contract

**Contract:** `XyloFacilitator.sol`

The smart contract is the settlement authority. It verifies EIP-3009 authorizations, transfers USDC from payer to beneficiary, and splits fees between the developer and the protocol treasury.

Key functions:

| Function | Purpose |
|----------|---------|
| `settlePayment(...)` | Verify EIP-3009 authorization, transfer USDC, split fee. |
| `settleDirect(...)` | Direct `transferFrom` path for Circle Programmable Wallets. |

Fee model:
- Protocol fee: **1% (100 bps)**.
- Fee is configurable by admin.
- Maximum fee: **10%**.
- Treasury receives the protocol portion; developer receives the net amount.

---

## Database Schema

XyloFacilitator uses Supabase PostgreSQL with the following tables:

| Table | Purpose |
|-------|---------|
| `xf_developers` | Registered developer accounts and SIWE-linked addresses. |
| `xf_api_routes` | Paywalled route definitions and pricing. |
| `xf_settlements` | Onchain settlement records and metadata. |
| `xf_agent_seeds` | Agent faucet seeding and one-time distribution tracking. |
| `xf_webhooks` | Webhook endpoint registrations. |
| `xf_webhook_events` | Delivered webhook event log. |
| `xf_analytics` | Aggregate platform analytics. |

---

## Authentication Flow

1. Agent requests `/auth/siwe/challenge`.
2. Server returns a nonce-bound SIWE message.
3. Agent signs the message with its wallet.
4. Agent submits signature to `/auth/siwe/verify`.
5. Server validates the signature and issues a 7-day JWT.
6. JWT is included in subsequent API requests via the `Authorization` header.

---

## Settlement Flow

1. Agent calls a paywalled seller API through `/proxy/:path`.
2. Proxy returns `402 Payment Required` with payment terms (amount, destination).
3. Agent SDK constructs an EIP-3009 `TransferWithAuthorization` signature.
4. Agent retries the request with the `x-payment` header containing the authorization.
5. Facilitator validates and submits the settlement on Arc.
6. On confirmation, the seller API returns the requested data.

For Circle wallets, `settleDirect` uses `transferFrom` with a pre-approval instead of EIP-3009.

---

## SDK Usage

Install the agent SDK:

```bash
npm install @xylonet/facilitator-sdk
```

Example agent call:

```ts
import { FacilitatorClient } from "@xylonet/facilitator-sdk";

const client = new FacilitatorClient({
  baseUrl: "https://facilitator.xylonet.com/v1",
  wallet: agentWallet,
});

const response = await client.payForApi({
  route: "https://api.seller.com/weather/nyc",
  maxAmount: 0.01,
  currency: "USDC",
});

console.log(response.data);
```

The SDK handles challenge discovery, EIP-3009 signing, retry logic, and receipt verification.

---

## Deployment

### Railway

The primary deployment target is Railway.

1. Push the `backend/` directory to a Git repository.
2. Create a Railway project and connect the repository.
3. Add environment variables in the Railway dashboard.
4. Railway will build and deploy the Docker image automatically.

### Docker

Build the backend image:

```bash
cd xylo-facilitator/backend
docker build -t xylofacilitator-backend .
```

Run locally:

```bash
docker run -p 3001:3001 --env-file .env xylofacilitator-backend
```

---

## Environment Variables

Create a `.env` file in `backend/`:

```env
PORT=3001
NODE_ENV=production

# Arc RPC
ARC_RPC_URL=https://rpc.arc.network
ARC_TESTNET_RPC_URL=https://rpc.testnet.arc.network
ARC_CHAIN_ID=0x7C49597c5C39c5278D1D37F2F5C35D1e8bD4faC2

# Contract addresses
FACILITATOR_CONTRACT=0x...
USDC_CONTRACT=0x...

# Auth
JWT_SECRET=your_jwt_secret
SIWE_DOMAIN=facilitator.xylonet.com

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Circle
CIRCLE_API_KEY=your_circle_api_key
CIRCLE_ENTITY_SECRET=your_entity_secret

# Rate limits
RATE_LIMIT_IP=10
RATE_LIMIT_PROXY=100

# Optional: monitoring
SENTRY_DSN=your_sentry_dsn
```

---

## Security

- **SIWE authentication** for developer and agent sessions.
- **SHA256 API key hashing** for route credentials.
- **SSRF prevention** on the proxy layer to restrict upstream destinations.
- **Rate limiting** at IP and route levels.
- **Reentrancy guards** in the settlement contract.
- **EIP-3009 on-chain verification** to prevent forged authorizations.
- **Hard fee caps** to protect payers from unexpected charges.

---

## Repository Structure

```
xylo-facilitator/
├── backend/
│   ├── src/
│   │   ├── routes/           # API route handlers
│   │   ├── services/         # Settlement, auth, proxy logic
│   │   ├── middleware/       # Rate limiting, validation
│   │   └── index.ts          # Express server entry
│   ├── Dockerfile
│   ├── package.json
│   └── .env.example
├── contracts/
│   └── XyloFacilitator.sol
├── circle-setup/
│   └── setup.ts
├── packages/
│   └── sdk/
│       ├── src/
│       └── package.json
└── README.md
```

---

## License

See the repository root `LICENSE` file.
