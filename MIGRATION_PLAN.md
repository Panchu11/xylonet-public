# XyloNet Data Infrastructure Migration Plan

## Overview

This document outlines the migration from Goldsky (no longer supporting Arc testnet) to a Blockscout-based data indexing solution for XyloNet's points system, PayX stats, and all on-chain data fetching.

**Migration Date**: February 2025  
**Status**: In Progress  
**Priority**: Critical

---

## Problem Statement

1. **Goldsky stopped supporting Arc testnet** - All subgraph endpoints are non-functional
2. **Goldsky free plan limits reached** - Would require paid plan even if testnet was supported
3. **Supabase free plan limits reached** - Already upgraded to Pro plan (resolved)

### Impact
- User points not being calculated/distributed
- PayX stats (tips, volume, 24h metrics) not updating
- Swap volume and TVL stats stale
- Leaderboard not reflecting current activity

---

## Current Architecture

### Data Sources (Before Migration)

| Source | Purpose | Status |
|--------|---------|--------|
| Goldsky Subgraphs | Indexed swap/vault/bridge/PayX events via GraphQL | **DEAD** |
| Blockscout API | REST API fallback for event fetching | **WORKING** |
| Direct RPC | Fallback for event logs (10K block limit) | **WORKING** |
| Supabase | Users, points, tips, stats storage | **WORKING** (Pro plan) |

### Files Using Goldsky (Direct Impact)

```
frontend/src/lib/points/goldsky-import.ts    # Main importer
frontend/scripts/fast-points-update.js       # Points update script
frontend/scripts/full-points-update.js       # Full recalculation
frontend/scripts/run-points-update.js        # Runner script
frontend/src/app/api/points/import/route.ts  # Import API endpoint
```

### Files Using Blockscout (Already Working)

```
frontend/src/lib/points/blockscout.ts        # Primary event fetcher
frontend/src/lib/points/blockchain.ts        # Uses Blockscout with RPC fallback
frontend/src/app/api/payx/stats/route.ts     # PayX stats (partial)
```

---

## Solution: Blockscout-First Architecture

### Why Blockscout?

| Criteria | Blockscout | Envio | The Graph | Subsquid |
|----------|------------|-------|-----------|----------|
| Arc Testnet Support | Yes (native) | Yes | No | Custom deploy |
| Cost | FREE | Free tier limited | Paid | Free tier |
| Rate Limits | 5 req/sec | 750 hrs/month | N/A | Varies |
| Setup Required | None (already integrated) | New deployment | N/A | New deployment |
| Data Freshness | Real-time | Minutes | Minutes | Minutes |

### New Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND                                  │
│  Hero.tsx  PayXShowcase.tsx  PointsDashboard.tsx  Campaign.tsx  │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    API ROUTES (Next.js)                          │
│  /api/points    /api/payx/stats    /api/leaderboard             │
└───────────────────────────────┬─────────────────────────────────┘
                                │
            ┌───────────────────┴───────────────────┐
            ▼                                       ▼
┌───────────────────────┐              ┌───────────────────────────┐
│      SUPABASE         │              │   BLOCKSCOUT API          │
│  (Pro Plan - Storage) │◄─────────────│   testnet.arcscan.app     │
│                       │   CRON SYNC  │   (Primary Event Source)  │
│  - users              │              └───────────────────────────┘
│  - payx_tips          │                          │
│  - payx_users         │                          │
│  - points_*           │              ┌───────────────────────────┐
│  - stats_cache (NEW)  │              │   ARC RPC (Fallback)      │
└───────────────────────┘              │   rpc.testnet.arc.network │
                                       └───────────────────────────┘
```

---

## Migration Phases

### Phase 1: Remove Goldsky Dependencies (Immediate)

**Objective**: Replace all Goldsky GraphQL calls with Blockscout REST API

**Files to Modify**:
1. `frontend/src/lib/points/goldsky-import.ts` - Rewrite to use Blockscout
2. `frontend/src/app/api/points/import/route.ts` - Update import endpoint
3. `frontend/src/app/api/points/recalculate/route.ts` - Ensure Blockscout usage

**Changes**:
- Remove Goldsky endpoint constants
- Replace GraphQL queries with Blockscout REST calls
- Use existing `fetchAllEventsBlockscout()` from `blockscout.ts`

### Phase 2: Historical Data Sync

**Objective**: Backfill all historical events from deployment block to current

**Approach**:
1. Use Blockscout API to fetch all historical events
2. Process in batches (1000 events per page)
3. Store in Supabase with deduplication via `tx_hash`

**Contracts to Index**:
| Contract | Address | Events |
|----------|---------|--------|
| USDC-EURC Pool | `0x3DF3966F5138143dce7a9cFDdC2c0310ce083BB1` | Swap |
| USDC-USYC Pool | `0x8296cC7477A9CD12cF632042fDDc2aB89151bb61` | Swap |
| XyloVault | `0x240Eb85458CD41361bd8C3773253a1D78054f747` | Deposit, Withdraw |
| TokenMessenger (CCTP) | `0x8FE6B999Dc680CcFDD5Bf7EB0974218be2542DAA` | DepositForBurn |
| PayX Tipping | `NEXT_PUBLIC_PAYX_CONTRACT_ADDRESS` | TipSent |

**Deployment Block**: `17100000` (XyloNet contracts)

### Phase 3: Continuous Indexing (Cron)

**Objective**: Keep data fresh with scheduled syncs

**Implementation Options**:

1. **Vercel Cron** (Recommended for current setup)
   - Configure in `vercel.json`
   - Run every 5-15 minutes
   - Use existing `/api/payx/stats` POST endpoint pattern

2. **External Cron Service** (Alternative)
   - cron-job.org (free)
   - GitHub Actions scheduled workflow

**Cron Jobs Needed**:
| Job | Endpoint | Frequency | Purpose |
|-----|----------|-----------|---------|
| PayX Sync | `POST /api/payx/stats` | 5 min | Index new tips |
| Points Sync | `POST /api/cron/process-points` | 15 min | Process swap/vault events |
| Stats Cache | `POST /api/stats/refresh` (NEW) | 30 min | Pre-compute aggregates |

### Phase 4: Performance Optimization

**Objective**: Ensure fast page loads with pre-computed stats

**New Tables**:
```sql
CREATE TABLE IF NOT EXISTS stats_cache (
  id VARCHAR(50) PRIMARY KEY,
  category VARCHAR(50) NOT NULL,  -- 'xylonet', 'payx', 'points'
  stat_key VARCHAR(100) NOT NULL,
  stat_value DECIMAL(20, 6),
  stat_json JSONB,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(category, stat_key)
);
```

**Cached Stats**:
- Total swap volume (all-time)
- Total bridge volume
- Total vault deposits
- Total PayX tips/volume
- 24h metrics for each
- User counts

---

## Stats Display Locations

| Component | File | Stats Displayed | Data Source |
|-----------|------|-----------------|-------------|
| Hero | `components/landing/Hero.tsx` | TVL, Total Volume, Users, Gas | On-chain + Supabase |
| PayX Showcase | `components/landing/PayXShowcase.tsx` | Tips 24h, Volume 24h, Totals | Supabase (payx_tips) |
| Campaign | `components/landing/Campaign.tsx` | User XP, Rank, Tasks, Users | Supabase (users, tasks) |
| Points Dashboard | `components/points/PointsDashboard.tsx` | Points breakdown | Supabase (users) |
| Points Leaderboard | `components/points/PointsLeaderboard.tsx` | Rankings | Supabase (users) |
| On-Chain Progress | `components/points/OnChainProgress.tsx` | Volume progress | Supabase (users) |
| Milestone Tracker | `components/points/MilestoneTracker.tsx` | Achievements | Supabase (volume_milestones) |

---

## API Endpoints Affected

| Endpoint | Method | Purpose | Changes Needed |
|----------|--------|---------|----------------|
| `/api/points` | GET | User points data | None (reads Supabase) |
| `/api/points/import` | POST | Import historical data | Update to use Blockscout |
| `/api/points/recalculate` | POST | Recalculate all points | Verify Blockscout usage |
| `/api/payx/stats` | GET | PayX statistics | None (reads Supabase) |
| `/api/payx/stats` | POST | Sync blockchain events | Already uses RPC, optimize |
| `/api/payx/recent-tips` | GET | Recent tips feed | None (reads Supabase) |
| `/api/leaderboard` | GET | Points leaderboard | None (reads Supabase) |
| `/api/users` | GET | User count | None (reads Supabase) |
| `/api/cron/process-points` | POST | Batch points processing | Enable and configure |

---

## Blockscout API Reference

### Base URL
```
https://testnet.arcscan.app/api
```

### Rate Limits
- No API key: 5 requests/second (300/minute)
- With API key: 10 requests/second
- Whitelisted: 25 requests/second

### Key Endpoints Used

**Get Logs by Contract**
```
GET /api?module=logs&action=getLogs&address={contract}&topic0={eventSig}&fromBlock={from}&toBlock={to}
```

**Get Transaction List**
```
GET /api?module=account&action=txlist&address={contract}&startblock={from}&endblock={to}
```

### Event Topic Signatures
```javascript
const EVENT_TOPICS = {
  SWAP: '0x54787c404bb33c88e86f4baf88183a3b0141d0a848e6a9f7a13b66ae3a9b73d1',
  BRIDGE: '0x2fa9ca894982930190727e75500a97d8dc500233a5065e0f3126c48fbe0343c0',
  VAULT_DEPOSIT: '0xdcbc1c05240f31ff3ad067ef1ee35ce4997762752e3a095284754544f4c709d7',
  VAULT_WITHDRAW: '0xfbde797d201c681b91056529119e0b02407c7bb96a4a2c75c01fc9667232c8db',
};
```

---

## Testing Checklist

### After Phase 1
- [ ] Points import works without Goldsky
- [ ] No errors referencing Goldsky endpoints
- [ ] Build succeeds

### After Phase 2
- [ ] All historical swap events in Supabase
- [ ] All historical PayX tips in Supabase
- [ ] All historical vault deposits in Supabase
- [ ] User volumes match on-chain data

### After Phase 3
- [ ] Cron jobs running on schedule
- [ ] New events indexed within 15 minutes
- [ ] No duplicate entries

### After Phase 4
- [ ] Hero stats load instantly
- [ ] PayX Showcase stats accurate
- [ ] Points page loads quickly
- [ ] Leaderboard up to date

---

## Rollback Plan

If migration fails:

1. **Immediate**: Revert to showing cached/static data
2. **Short-term**: Re-enable RPC-only fetching (slower but works)
3. **Long-term**: Consider paid Goldsky or alternative indexer

---

## Timeline

| Phase | Duration | Status |
|-------|----------|--------|
| Phase 1: Remove Goldsky | 1-2 hours | In Progress |
| Phase 2: Historical Sync | 2-4 hours | Pending |
| Phase 3: Cron Setup | 1 hour | Pending |
| Phase 4: Optimization | 2-3 hours | Pending |

---

## Success Metrics

1. **Data Freshness**: New events indexed within 15 minutes
2. **Page Load**: Stats visible within 2 seconds
3. **Accuracy**: Stats match on-chain data (verify via block explorer)
4. **Reliability**: Zero Goldsky-related errors in logs
5. **Cost**: $0 additional infrastructure cost

---

## Contact

For questions about this migration, refer to the codebase or create an issue.
