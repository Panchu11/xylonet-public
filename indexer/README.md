# XyloNet Indexer

## Overview

The XyloNet indexer is a HyperIndex-powered event indexer built with Envio v3.2.1. It ingests onchain events from XyloNet smart contracts deployed on Arc Testnet, normalizes them into a relational PostgreSQL schema, and exposes a high-performance GraphQL API through Hasura. The indexer is the primary analytics data source for the XyloNet frontend and any third-party integrations that require aggregated protocol metrics, historical swap data, liquidity events, vault activity, PayX tips, and protocol-level statistics.

By indexing events at the contract level, the indexer eliminates the need for frontend polling or approximation of aggregate metrics. Query responses are fast, paginated, and suitable for dashboards, leaderboards, and analytics pages.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Arc Testnet RPC                         │
│            (Chain ID 5042002, start block 17100000)         │
└──────────────────────────┬──────────────────────────────────┘
                           │
              ┌────────────▼─────────────┐
              │    Envio HyperIndex      │
              │   (event transformers)   │
              └────────────┬─────────────┘
                           │
              ┌────────────▼─────────────┐
              │      PostgreSQL          │
              │   (indexed entities)     │
              └────────────┬─────────────┘
                           │
              ┌────────────▼─────────────┐
              │         Hasura           │
              │    (GraphQL API layer)   │
              └──────────────────────────┘
```

Envio listens to specified contract addresses and event signatures, applies handler logic written in TypeScript, and writes derived entities into PostgreSQL. Hasura then auto-generates a GraphQL schema over these tables, allowing consumers to query indexed data with filters, ordering, aggregation, and pagination.

---

## Technology Stack

| Component | Technology |
|-----------|------------|
| Indexing Framework | Envio HyperIndex v3.2.1 |
| Handler Language | TypeScript |
| Database | PostgreSQL |
| GraphQL Layer | Hasura |
| Deployment | Envio Cloud (primary), self-hosted Coolify (optional) |

---

## Contracts Indexed

All contracts are deployed on Arc Testnet. Indexing begins at block **17100000**.

| Contract | Address | Events |
|----------|---------|--------|
| XyloPoolUsdcEurc | `0x3DF3966F5138143dce7a9cFDdC2c0310ce083BB1` | Swap, AddLiquidity, RemoveLiquidity, RemoveLiquidityOne |
| XyloPoolUsdcUsyc | `0x8296cC7477A9CD12cF632042fDDc2aB89151bb61` | Swap, AddLiquidity, RemoveLiquidity, RemoveLiquidityOne |
| XyloVault | `0x240Eb85458CD41361bd8C3773253a1D78054f747` | Deposit, Withdraw |
| PayXTipping | `0xA312c384770B7b49E371DF4b7AF730EFEF465913` | TipSent, TipsClaimed |
| XyloFactory | `0x60EDeFB094B84BBC6430cc130B358A43Ba1979e2` | PoolCreated |

---

## GraphQL Entities

The indexer exposes the following entity types through Hasura GraphQL:

### Event Entities

| Entity | Description |
|--------|-------------|
| `Swap` | Individual swap transactions including tokenIn, tokenOut, amountIn, amountOut, and price impact. |
| `LiquidityEvent` | AddLiquidity, RemoveLiquidity, and RemoveLiquidityOne events. |
| `VaultEvent` | Vault deposits and withdrawals. |
| `Tip` | PayX tip sent events with handle hash, amount, and message. |
| `TipClaim` | PayX tip claim events with recipient and claimed amount. |

### Aggregate Entities

| Entity | Description |
|--------|-------------|
| `Pool` | Current pool state including reserves, amplification, fees, and volume. |
| `DailyVolume` | Protocol-wide daily traded volume. |
| `PoolDailyVolume` | Per-pool daily traded volume. |
| `ProtocolUser` | Unique addresses that have interacted with the protocol. |
| `ProtocolStats` | High-level metrics such as total volume, total users, total transactions, and TVL. |

---

## Schema

The GraphQL schema is defined in `schema.graphql` and is materialized into PostgreSQL tables by Envio. Key relationships:

- A `Pool` has many `Swap` events.
- A `Pool` has many `LiquidityEvent` records.
- A `Pool` has many `PoolDailyVolume` snapshots.
- A `ProtocolUser` can have many `Swap`, `LiquidityEvent`, `VaultEvent`, and `Tip` records.
- `ProtocolStats` aggregates across all event types.

---

## Event Handlers

Event handlers live in `src/handlers/` and are written in TypeScript. Each handler:

1. Receives the decoded event payload and block/transaction context.
2. Computes derived values (e.g., USD-denominated amounts, price impact).
3. Inserts or updates entities in the database.
4. Updates aggregate tables such as `DailyVolume`, `PoolDailyVolume`, and `ProtocolStats`.

Handlers are deterministic and idempotent: the same chain history will always produce the same indexed state.

---

## Configuration

The indexer configuration is defined in `config.yaml`. Key sections:

- **networks** — chain ID, RPC endpoint, start block.
- **contracts** — contract names, addresses, and ABI paths.
- **eventHandlers** — mapping from event signatures to handler files.

Example excerpt:

```yaml
networks:
  - id: 5042002
    rpc_config:
      url: https://rpc-arc-testnet.example.com
    start_block: 17100000
    contracts:
      - name: XyloPoolUsdcEurc
        address: 0x3DF3966F5138143dce7a9cFDdC2c0310ce083BB1
      - name: XyloPoolUsdcUsyc
        address: 0x8296cC7477A9CD12cF632042fDDc2aB89151bb61
      - name: XyloVault
        address: 0x240Eb85458CD41361bd8C3773253a1D78054f747
      - name: PayXTipping
        address: 0xA312c384770B7b49E371DF4b7AF730EFEF465913
      - name: XyloFactory
        address: 0x60EDeFB094B84BBC6430cc130B358A43Ba1979e2
```

---

## Local Development

### Prerequisites

- Docker and Docker Compose
- Node.js 20+
- npm

### Install Dependencies

```bash
cd indexer
npm install
```

### Start Local Services

A `docker-compose.yml` file is provided to spin up PostgreSQL and Hasura locally:

```bash
docker-compose up -d
```

This will start:
- PostgreSQL on port `5432`
- Hasura Console on port `8080`

### Run the Indexer

```bash
npm run dev
```

Envio will begin syncing from the configured start block and populate the local database. The Hasura console will be available at `http://localhost:8080` for exploring the GraphQL schema.

### Regenerate Types

After modifying `schema.graphql` or `config.yaml`, regenerate the TypeScript bindings:

```bash
npm run codegen
```

---

## Deployment

### Envio Cloud

The primary deployment target is Envio Cloud.

1. Build the indexer:

```bash
npm run build
```

2. Deploy using the Envio CLI:

```bash
envio deploy
```

3. Note the deployed GraphQL endpoint and update `NEXT_PUBLIC_ENVIO_URL` in the frontend environment.

### Self-Hosted Coolify Option

For teams that prefer full infrastructure control, a Docker-based self-hosted option is supported via Coolify:

1. Build the Docker image:

```bash
docker build -t xylonet-indexer .
```

2. Push to your container registry.

3. Deploy the container in Coolify, pointing it at a managed PostgreSQL instance and Hasura service.

The provided `Dockerfile` packages the indexer and its dependencies for containerized execution.

---

## Querying

Once deployed, the GraphQL endpoint can be queried directly:

```graphql
query GetProtocolStats {
  ProtocolStats {
    totalVolume
    totalUsers
    totalTransactions
    tvl
  }
}
```

```graphql
query GetRecentSwaps($limit: Int!) {
  Swap(limit: $limit, order_by: { timestamp: desc }) {
    id
    pool
    tokenIn
    tokenOut
    amountIn
    amountOut
    timestamp
  }
}
```

```graphql
query GetPoolVolume($pool: String!) {
  PoolDailyVolume(
    where: { pool: { _eq: $pool } }
    order_by: { date: desc }
    limit: 30
  ) {
    date
    volume
  }
}
```

---

## Repository Structure

```
indexer/
├── abis/                   # Contract ABIs
├── src/
│   └── handlers/           # TypeScript event handlers
├── config.yaml             # Envio network/contract configuration
├── schema.graphql          # Indexed entity schema
├── docker-compose.yml      # Local PostgreSQL + Hasura stack
├── Dockerfile              # Production container image
├── package.json            # Dependencies and scripts
└── tsconfig.json           # TypeScript configuration
```

---

## Best Practices

- Always update the indexer when new contracts are deployed or event signatures change.
- Prefer aggregate entities (`ProtocolStats`, `PoolDailyVolume`) over frontend approximations for zero-pagination metrics.
- Use Hasura filters and limits to avoid pulling unbounded result sets into the client.
- Backfill historical data from the configured start block rather than relying on contract-only sources for analytics.
- Monitor indexer sync health and RPC rate limits; implement retry and backoff logic in consumers if needed.

---

## License

See the repository root `LICENSE` file.
