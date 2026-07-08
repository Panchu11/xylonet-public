# XyloNet Agent Demo — AI Agents Paying for APIs

## Overview

The XyloNet Agent Demo is an end-to-end reference implementation that demonstrates autonomous AI agents paying for API access using USDC via the HTTP 402 protocol. The demo shows how an agent can detect payment requirements, sign an EIP-3009 authorization, attach proof of payment, and complete a paid API call in under one second on Arc Testnet.

This project is intended as a developer onboarding tool and proof of concept for the XyloFacilitator payment rail. It consists of two components: a **seller API** that exposes paywalled endpoints, and an **autonomous agent** that decides which endpoint to call, handles payment, and formats the response for the user.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                              User                                    │
│                 "What's the weather in Dubai?"                       │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
                               ▼
              ┌────────────────────────────────┐
              │           Agent                │
              │   Node.js + OpenAI LLM         │
              └──────┬──────────────────┬──────┘
                     │                  │
         ┌───────────▼────────┐  ┌──────▼──────────┐
         │   LLM Planner      │  │  Payment SDK    │
         │  (endpoint choice) │  │  (EIP-3009 sign)│
         └───────────┬────────┘  └──────┬──────────┘
                     │                  │
                     └──────────┬───────┘
                                │
                                ▼
              ┌────────────────────────────────┐
              │         Seller API             │
              │   Express.js paywalled server  │
              │   Returns 402 + payment terms  │
              └────────────────────────────────┘
                                │
                                ▼
              ┌────────────────────────────────┐
              │      XyloFacilitator           │
              │   (onchain settlement on Arc)  │
              └────────────────────────────────┘
```

Components:
- `seller-api/` — Express.js server exposing paid and free endpoints.
- `agent/` — Node.js autonomous agent using OpenAI to plan calls and the XyloFacilitator SDK to pay.

---

## How It Works

1. **User Query** — The user asks the agent a question, e.g., "What's the weather in Dubai?"
2. **LLM Decision** — The agent's planner selects the most relevant seller API endpoint.
3. **First API Call** — The agent calls the endpoint without payment.
4. **402 Response** — The seller API returns `402 Payment Required` with the required amount and destination.
5. **EIP-3009 Signing** — The agent SDK signs a `TransferWithAuthorization` authorization.
6. **Retry with Payment** — The agent retries the request with the `x-payment` header.
7. **Onchain Settlement** — XyloFacilitator settles the USDC transfer on Arc in less than one second.
8. **Data Returned** — The seller API validates payment and returns the requested data.
9. **Formatted Response** — The LLM formats the data into a natural-language answer for the user.

---

## Seller API

The seller API is an Express.js server that exposes both free and paid endpoints.

### Endpoints

| Method | Endpoint | Price | Description |
|--------|----------|-------|-------------|
| GET | `/api/weather/:city` | $0.01 USDC | Return current weather for a city. |
| POST | `/api/summarize` | $0.02 USDC | Summarize provided text. |
| GET | `/api/crypto-price/:symbol` | $0.005 USDC | Return current price for a crypto symbol. |
| GET | `/health` | Free | Health check. |

### Payment Gating

Paid endpoints return `402 Payment Required` when the `x-payment` header is missing or invalid:

```json
{
  "error": "Payment required",
  "amount": "0.01",
  "currency": "USDC",
  "destination": "0x..."
}
```

When a valid `x-payment` header is provided, the seller API forwards the settlement to XyloFacilitator for verification before returning the requested data.

---

## Agent

The agent is a Node.js application that uses OpenAI to interpret user queries and interact with the seller API.

Key modules:

| Module | Purpose |
|--------|---------|
| `planner.ts` | Uses LLM to choose the correct endpoint and extract parameters. |
| `payment.ts` | Signs EIP-3009 authorizations via the XyloFacilitator SDK. |
| `client.ts` | Calls seller endpoints and handles 402 retries. |
| `formatter.ts` | Formats raw API data into user-friendly responses. |

### Wallet Funding

Each agent wallet is auto-funded via the XyloFacilitator faucet, which distributes **10 USDC** one-time per address on Arc testnet.

---

## Setup Instructions

### Prerequisites

- Node.js 20+
- npm
- OpenAI API key
- Arc testnet RPC endpoint
- XyloFacilitator API endpoint

### 1. Install Dependencies

```bash
cd xylo-agent-demo
npm install
```

### 2. Configure Environment Variables

Create `.env` files in both `seller-api/` and `agent/`.

---

## Environment Variables

### Seller API (`seller-api/.env`)

```env
PORT=5000
NODE_ENV=development

# XyloFacilitator
FACILITATOR_API_URL=https://facilitator.xylonet.com/v1
FACILITATOR_CONTRACT=0x...
USDC_CONTRACT=0x...

# Arc
ARC_RPC_URL=https://rpc.arc.network
ARC_CHAIN_ID=5042002

# Seller wallet (receives payments)
SELLER_WALLET_PRIVATE_KEY=your_seller_key
SELLER_WALLET_ADDRESS=0x...

# Pricing
WEATHER_PRICE=0.01
SUMMARIZE_PRICE=0.02
CRYPTO_PRICE=0.005
```

### Agent (`agent/.env`)

```env
OPENAI_API_KEY=your_openai_key

# Seller API
SELLER_API_URL=http://localhost:5000

# XyloFacilitator
FACILITATOR_API_URL=https://facilitator.xylonet.com/v1

# Agent wallet
AGENT_WALLET_PRIVATE_KEY=your_agent_key

# Arc
ARC_RPC_URL=https://rpc.arc.network
ARC_CHAIN_ID=5042002
```

---

## Running the Demo

### Start the Seller API

```bash
cd seller-api
npm run dev
```

The seller API will be available at `http://localhost:5000`.

### Start the Agent

In a new terminal:

```bash
cd agent
npm run dev
```

### Example Interaction

```bash
curl -X POST http://localhost:5001/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What is the weather in Dubai?"}'
```

Expected response:

```json
{
  "answer": "The current weather in Dubai is sunny with a temperature of 38°C."
}
```

Behind the scenes, the agent paid $0.01 USDC to the seller API.

---

## Repository Structure

```
xylo-agent-demo/
├── seller-api/
│   ├── src/
│   │   ├── index.ts          # Express server entry
│   │   ├── routes/           # Weather, summarize, crypto-price routes
│   │   ├── middleware/       # Payment verification
│   │   └── config.ts         # Environment config
│   ├── package.json
│   └── .env.example
├── agent/
│   ├── src/
│   │   ├── index.ts          # Agent entry point
│   │   ├── planner.ts        # LLM endpoint planner
│   │   ├── payment.ts        # EIP-3009 signing
│   │   ├── client.ts         # Seller API client
│   │   └── formatter.ts      # Response formatter
│   ├── package.json
│   └── .env.example
└── README.md
```

---

## Key Concepts

### HTTP 402 Payment Required

HTTP 402 is a standard but rarely used status code that indicates the client must pay to access the resource. XyloFacilitator uses 402 to signal payment terms to agents before they authorize a transfer.

### EIP-3009 TransferWithAuthorization

EIP-3009 allows a token holder to authorize a transfer via an off-chain signature. The recipient (or a relayer) can submit the authorization onchain, enabling gasless or delegated payments. This is ideal for agents that hold USDC but do not want to manage separate approve transactions.

### Arc Settlement Speed

The demo relies on Arc's fast finality to settle USDC payments in under one second, making the agent interaction feel synchronous despite being onchain.

---

## Extending the Demo

To add a new paid endpoint:

1. Add the route in `seller-api/src/routes/`.
2. Define the price in `seller-api/.env`.
3. Update `agent/src/planner.ts` so the LLM knows how to call it.
4. Add a formatter in `agent/src/formatter.ts` if needed.

To integrate a different LLM provider, replace the OpenAI client in `agent/src/planner.ts` with your preferred SDK.

---

## License

See the repository root `LICENSE` file.
