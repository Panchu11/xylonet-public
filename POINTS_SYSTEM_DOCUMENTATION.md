# XyloNet Points System - Internal Documentation
**Version:** 2.0  
**Last Updated:** January 15, 2026  
**Status:** Production Ready

---

## Table of Contents

1. [Overview](#1-overview)
2. [Architecture](#2-architecture)
3. [Volume Points](#3-volume-points)
4. [Milestone Rewards](#4-milestone-rewards)
5. [First Interaction Bonuses](#5-first-interaction-bonuses)
6. [Quality Score System](#6-quality-score-system)
7. [Referral Program](#7-referral-program)
8. [Social Tasks](#8-social-tasks)
9. [Processing & Recalculation](#9-processing--recalculation)
10. [Database Schema](#10-database-schema)
11. [API Endpoints](#11-api-endpoints)
12. [Configuration Reference](#12-configuration-reference)
13. [Examples & Calculations](#13-examples--calculations)
14. [Future Extensibility](#14-future-extensibility)

---

## 1. Overview

### Purpose
The XyloNet Points System rewards users for genuine ecosystem participation across:
- **Swap** - Token trading on XyloNet DEX
- **Vault** - USDC deposits in yield vault
- **PayX** - Sending tips to social media handles
- **Referrals** - Inviting new users
- **Social Tasks** - Following Twitter, joining Discord, etc.

### Key Design Principles
1. **No Lifetime Caps** - Users can earn unlimited points over time
2. **Logarithmic Scaling** - Prevents gaming, rewards genuine activity
3. **Quality Multipliers** - Penalizes bots, rewards consistent users
4. **Tier-Based Referrals** - Diminishing returns prevent referral farming
5. **Dynamic Social Tasks** - New tasks auto-calculate on next processing

### Data Sources
- **Goldsky Subgraphs** - Real-time blockchain event indexing
- **Supabase** - User data, task completions, points storage

---

## 2. Architecture

### File Structure
```
frontend/src/lib/points/
├── config.ts           # All configuration constants
├── types.ts            # TypeScript type definitions
├── goldsky-import.ts   # Main processing & calculation logic
└── blockchain.ts       # Blockscout API client (backup)

frontend/src/app/api/points/
├── route.ts            # Get user points
├── leaderboard/route.ts # Leaderboard API
├── recalculate/route.ts # Trigger full recalculation
└── cron/route.ts       # Daily cron job endpoint
```

### Data Flow
```
Goldsky Subgraphs (Swaps, Vault, PayX)
           ↓
    goldsky-import.ts
           ↓
    Process Events → Calculate Volumes
           ↓
    Calculate Points (Volume + Milestones + Quality)
           ↓
    Supabase Users Table (update points columns)
```

---

## 3. Volume Points

### Formula
```
Points = floor(log₂(1 + volume/baseVolume) × multiplier)
```

### Product Configuration

| Product    | Base Volume | Multiplier | Min Tx | Daily Cap |
|------------|-------------|------------|--------|-----------|
| Swap       | $10         | 5×         | $5     | 200 pts   |
| Vault      | $25         | 8×         | $10    | 100 pts   |
| PayX Sent  | $1          | 3×         | $0.01  | 50 pts    |

### Why Logarithmic?
- **$10 swap** → log₂(1 + 10/10) × 5 = log₂(2) × 5 = **5 points**
- **$100 swap** → log₂(1 + 100/10) × 5 = log₂(11) × 5 = **17 points**
- **$1000 swap** → log₂(1 + 1000/10) × 5 = log₂(101) × 5 = **33 points**

This creates diminishing returns - 10× more volume does NOT give 10× more points.

### Code Reference
```typescript
function calculateLogVolumePoints(volume: number, productType: ProductType): number {
  if (volume <= 0) return 0;
  const config = PRODUCT_CONFIG[productType];
  const logValue = Math.log2(1 + volume / config.baseVolume);
  const points = Math.floor(logValue * config.multiplier);
  return Math.min(points, config.dailyCap * 365); // Annual cap as safety
}
```

---

## 4. Milestone Rewards

One-time bonuses for reaching cumulative volume thresholds.

### Swap Milestones
| Tier     | Threshold | Points |
|----------|-----------|--------|
| Bronze   | $50       | 25     |
| Silver   | $250      | 75     |
| Gold     | $1,000    | 150    |
| Platinum | $5,000    | 300    |
| Diamond  | $25,000   | 500    |

**Total Swap Milestones: 1,050 points**

### Vault Milestones
| Tier     | Threshold | Points |
|----------|-----------|--------|
| Bronze   | $50       | 20     |
| Silver   | $250      | 60     |
| Gold     | $1,000    | 125    |
| Platinum | $5,000    | 250    |

**Total Vault Milestones: 455 points**

### PayX Milestones
| Tier     | Threshold | Points |
|----------|-----------|--------|
| Bronze   | $10       | 20     |
| Silver   | $50       | 50     |
| Gold     | $250      | 100    |
| Platinum | $1,000    | 190    |

**Total PayX Milestones: 360 points**

### Code Reference
```typescript
function calculateProductMilestonePoints(volume: number, category: MilestoneCategory): number {
  const milestones = MILESTONE_CONFIG[category] || [];
  let points = 0;
  for (const milestone of milestones) {
    if (volume >= milestone.threshold) {
      points += milestone.points;
    }
  }
  return points;
}
```

---

## 5. First Interaction Bonuses

One-time rewards for trying each product.

| Action           | Min Volume | Points |
|------------------|------------|--------|
| First Swap       | $5         | 50     |
| First Vault      | $10        | 50     |
| First PayX Tip   | $1         | 50     |

**Total First Interaction: 150 points**

### Code Reference
```typescript
function calculateFirstInteractionPoints(swapVol, vaultVol, payxVol) {
  let points = 0;
  if (swapVol >= 5) points += 50;   // First Swap
  if (vaultVol >= 10) points += 50; // First Vault
  if (payxVol >= 1) points += 50;   // First PayX
  return points;
}
```

---

## 6. Quality Score System

### Purpose
Quality Score (0-100) determines a multiplier applied to volume points.
- Rewards genuine, consistent users
- Penalizes bots and farmers

### Score Components

| Component            | Max Points | Calculation                           |
|----------------------|------------|---------------------------------------|
| Account Age          | 25         | 1 point per day (max 25 days)         |
| Product Diversity    | 25         | 0/5/12/19/25 for 0/1/2/3/4 products   |
| Activity Consistency | 25         | (active_days / account_age_days) × 25 |
| Avg Transaction Size | 15         | $100+: 15, $50+: 10, $10+: 5          |

**Maximum Quality Score: 90 points** (theoretical max with all factors)

### Quality Multipliers

| Score Range | Category       | Multiplier |
|-------------|----------------|------------|
| 0-20        | Suspected Bot  | 0.5×       |
| 21-40       | New User       | 0.75×      |
| 41-60       | Normal         | 1.0×       |
| 61-80       | Quality User   | 1.15×      |
| 81-100      | Premium User   | 1.25×      |

### Code Reference
```typescript
function calculateQualityScore(totalVolume, productsUsed, activeDays, accountAgeDays): number {
  let score = 0;
  
  // Account Age: 1 pt/day, max 25
  score += Math.min(25, accountAgeDays);
  
  // Product Diversity
  const diversityPoints = [0, 5, 12, 19, 25];
  score += diversityPoints[Math.min(productsUsed, 4)] || 0;
  
  // Activity Consistency
  if (accountAgeDays > 0) {
    score += Math.floor((activeDays / accountAgeDays) * 25);
  }
  
  // Avg Tx Size
  if (totalVolume >= 100) score += 15;
  else if (totalVolume >= 50) score += 10;
  else if (totalVolume >= 10) score += 5;
  
  return Math.min(100, score);
}

function getQualityMultiplier(score: number): number {
  if (score <= 20) return 0.5;
  if (score <= 40) return 0.75;
  if (score <= 60) return 1.0;
  if (score <= 80) return 1.15;
  return 1.25;
}
```

---

## 7. Referral Program

### Tier-Based Decay System

| Referral # | Points Each |
|------------|-------------|
| 1-10       | 50          |
| 11-25      | 25          |
| 26-50      | 10          |
| 51+        | 5           |

### Example Calculations
- **5 referrals:** 5 × 50 = **250 points**
- **15 referrals:** (10 × 50) + (5 × 25) = 500 + 125 = **625 points**
- **30 referrals:** (10 × 50) + (15 × 25) + (5 × 10) = 500 + 375 + 50 = **925 points**
- **100 referrals:** (10 × 50) + (15 × 25) + (25 × 10) + (50 × 5) = 500 + 375 + 250 + 250 = **1,375 points**

### Referral Qualification Requirements
A referral counts as "successful" when the referred user:
1. Account age ≥ 48 hours
2. Total volume ≥ $100
3. Used at least 2 products
4. Active on at least 3 different days
5. Must qualify within 30 days of signup

### Referred User Bonus
If a user was referred AND qualifies (≥$100 volume), they receive **+50 bonus points**.

### Code Reference
```typescript
function calculateTotalReferralPoints(successfulReferrals: number): number {
  let total = 0;
  for (let i = 1; i <= successfulReferrals; i++) {
    if (i <= 10) total += 50;
    else if (i <= 25) total += 25;
    else if (i <= 50) total += 10;
    else total += 5;
  }
  return total;
}
```

---

## 8. Social Tasks

### Current Active Tasks

| Task                 | Points | URL                          | Status   |
|----------------------|--------|------------------------------|----------|
| Follow @Xylonet_     | 50     | x.com/Xylonet_              | Active   |
| Join Discord         | 50     | discord.gg/mcDkHNrFyA       | Active   |
| Follow @Arc_Ecosystem| 50     | x.com/Arc_Ecosystem          | Active   |
| Follow @payx_tip     | 50     | x.com/payx_tip               | Active   |
| Like Tweet           | 25     | -                            | Inactive |
| Retweet              | 25     | -                            | Inactive |

**Total Active Social Points: 200 points** (4 tasks x 50 pts)

### How Social Tasks Work
1. User completes task in UI
2. Completion stored in `task_completions` table
3. Points calculated on next recalculation by joining `task_completions` with `tasks` table
4. Only tasks with `task_type = 'social'` are counted

### Adding New Tasks
1. Insert new task in `tasks` table:
   ```sql
   INSERT INTO tasks (name, description, points, task_type, is_active)
   VALUES ('new_task', 'Description', 30, 'social', true);
   ```
2. Points will auto-calculate on next processing cycle

### Code Reference
```typescript
async function calculateSocialPoints(userId: string): Promise<number> {
  const { data: completions } = await supabase
    .from('task_completions')
    .select('task_id, tasks!inner(name, points, is_active, task_type)')
    .eq('user_id', userId);
  
  let points = 0;
  for (const completion of completions || []) {
    const task = completion.tasks;
    if (task && task.task_type === 'social') {
      points += task.points || 0;
    }
  }
  return points;
}
```

---

## 9. Processing & Recalculation

### Daily Cron Job
- **Schedule:** Daily at midnight UTC
- **Endpoint:** `/api/points/cron`
- **Vercel Config:** `vercel.json` with cron schedule

### Manual Recalculation
- **Endpoint:** `POST /api/points/recalculate`
- **Auth:** Localhost bypass or `x-admin-key` header
- **Timeout:** 5 minutes (300 seconds)

### Processing Flow
```
1. Fetch users with activity (swap/vault/payx/referrals > 0)
2. Process in batches of 1000 users
3. For each user:
   a. Calculate quality score
   b. Calculate volume points (with quality multiplier)
   c. Calculate milestone points
   d. Calculate first interaction points
   e. Calculate referral points
   f. Calculate social points
   g. Update user record
4. Process users with only social completions
5. Log summary
```

### Performance
- **Batch Size:** 1000 users
- **Concurrent Updates:** 50 users at a time
- **Estimated Time:** ~68k users in ~5 minutes

---

## 10. Database Schema

### Users Table (Points Columns)
```sql
-- Volume tracking
cumulative_swap_volume    DECIMAL(18,2) DEFAULT 0
cumulative_vault_volume   DECIMAL(18,2) DEFAULT 0
cumulative_payx_sent      DECIMAL(18,2) DEFAULT 0

-- Points breakdown
volume_points             INTEGER DEFAULT 0
milestone_points          INTEGER DEFAULT 0
first_interaction_points  INTEGER DEFAULT 0
referral_points           INTEGER DEFAULT 0
social_points             INTEGER DEFAULT 0
total_points              INTEGER DEFAULT 0

-- Quality & Activity
quality_score             INTEGER DEFAULT 0
active_days               INTEGER DEFAULT 0
products_used             INTEGER DEFAULT 0

-- Referrals
referral_code             VARCHAR(20) UNIQUE
referred_by_code          VARCHAR(20)
successful_referrals      INTEGER DEFAULT 0
```

### Tasks Table
```sql
id           UUID PRIMARY KEY
name         VARCHAR(100) UNIQUE
description  TEXT
points       INTEGER
task_type    VARCHAR(50)  -- 'social', 'onchain', etc.
is_active    BOOLEAN DEFAULT true
```

### Task Completions Table
```sql
id           UUID PRIMARY KEY
user_id      UUID REFERENCES users(id)
task_id      UUID REFERENCES tasks(id)
completed_at TIMESTAMPTZ DEFAULT NOW()
UNIQUE(user_id, task_id)
```

---

## 11. API Endpoints

### GET /api/points?wallet={address}
Returns user's points breakdown.

**Response:**
```json
{
  "success": true,
  "data": {
    "total_points": 1250,
    "volume_points": 450,
    "milestone_points": 350,
    "first_interaction_points": 150,
    "referral_points": 200,
    "social_points": 100,
    "quality_score": 72,
    "rank": 156
  }
}
```

### GET /api/points/leaderboard?limit=100
Returns top users by points.

**Response:**
```json
{
  "success": true,
  "data": [
    { "rank": 1, "wallet": "0x...", "total_points": 5420 },
    { "rank": 2, "wallet": "0x...", "total_points": 4890 }
  ]
}
```

### POST /api/points/recalculate
Triggers full recalculation.

**Headers:** `x-admin-key: {ADMIN_API_KEY}` (not required for localhost)

**Response:**
```json
{
  "success": true,
  "data": {
    "usersProcessed": 68432,
    "totalPointsAwarded": 4521890
  }
}
```

---

## 12. Configuration Reference

### File: `frontend/src/lib/points/config.ts`

```typescript
// Product Configuration
PRODUCT_CONFIG = {
  swap: { baseVolume: 10, multiplier: 5, minTxVolume: 5, dailyCap: 200 },
  vault: { baseVolume: 25, multiplier: 8, minTxVolume: 10, dailyCap: 100 },
  payx_sent: { baseVolume: 1, multiplier: 3, minTxVolume: 0.01, dailyCap: 50 },
}

// Milestones
MILESTONE_CONFIG = {
  swap: [
    { tier: 'bronze', threshold: 50, points: 25 },
    { tier: 'silver', threshold: 250, points: 75 },
    { tier: 'gold', threshold: 1000, points: 150 },
    { tier: 'platinum', threshold: 5000, points: 300 },
    { tier: 'diamond', threshold: 25000, points: 500 },
  ],
  // ... vault, payx
}

// Referral Tiers
REFERRAL_TIERS = [
  { minReferral: 1, maxReferral: 10, pointsEach: 50 },
  { minReferral: 11, maxReferral: 25, pointsEach: 25 },
  { minReferral: 26, maxReferral: 50, pointsEach: 10 },
  { minReferral: 51, maxReferral: Infinity, pointsEach: 5 },
]

// Quality Multipliers
QUALITY_MULTIPLIERS = [
  { minScore: 0, maxScore: 20, multiplier: 0.5 },
  { minScore: 21, maxScore: 40, multiplier: 0.75 },
  { minScore: 41, maxScore: 60, multiplier: 1.0 },
  { minScore: 61, maxScore: 80, multiplier: 1.15 },
  { minScore: 81, maxScore: 100, multiplier: 1.25 },
]
```

---

## 13. Examples & Calculations

### Example 1: New User ($100 Swap)

```
Input:
- Swap Volume: $100
- Account Age: 5 days
- Products Used: 1
- Active Days: 2

Quality Score:
- Account Age: 5 pts
- Product Diversity: 5 pts (1 product)
- Activity Consistency: (2/5) × 25 = 10 pts
- Avg Tx Size: 15 pts ($100+)
- Total: 35 → Multiplier: 0.75×

Volume Points:
- log₂(1 + 100/10) × 5 = 17.3 → 17 pts
- With multiplier: 17 × 0.75 = 12.75 → 12 pts

Milestones:
- Bronze ($50+): 25 pts

First Interaction:
- First Swap: 50 pts

TOTAL: 12 + 25 + 50 = 87 points
```

### Example 2: Active Multi-Product User

```
Input:
- Swap Volume: $500
- Vault Volume: $200
- PayX Volume: $25
- Account Age: 30 days
- Products Used: 3
- Active Days: 20
- Twitter + Discord completed

Quality Score:
- Account Age: 25 pts (max)
- Product Diversity: 19 pts (3 products)
- Activity Consistency: (20/30) × 25 = 16.67 → 16 pts
- Avg Tx Size: 15 pts
- Total: 75 → Multiplier: 1.15×

Volume Points:
- Swap: log₂(51) × 5 = 28.4 → 28 pts
- Vault: log₂(9) × 8 = 25.4 → 25 pts
- PayX: log₂(26) × 3 = 14.1 → 14 pts
- Raw Total: 67 pts
- With multiplier: 67 × 1.15 = 77 pts

Milestones:
- Swap Silver ($250+): 25 + 75 = 100 pts
- Vault Bronze ($50+): 20 pts
- PayX Silver ($50+): 20 + 50 = 70 pts (wait, PayX is $25, so only Bronze: 20 pts)
- Total: 100 + 20 + 20 = 140 pts

First Interaction:
- Swap + Vault + PayX: 150 pts

Social:
- All 4 tasks (XyloNet + Discord + Arc + PayX TipBot): 200 pts

TOTAL: 77 + 140 + 150 + 200 = 567 points
```

### Example 3: Referral Champion

```
Input:
- 35 successful referrals
- Was referred themselves with $150 volume

Referral Points:
- 1-10: 10 × 50 = 500 pts
- 11-25: 15 × 25 = 375 pts
- 26-35: 10 × 10 = 100 pts
- Total: 975 pts

Referred Bonus:
- Qualified ($150 > $100): +50 pts

REFERRAL TOTAL: 1,025 points
```

---

## 14. Future Extensibility

### Adding New Products
1. Add product config to `PRODUCT_CONFIG` in `config.ts`
2. Add milestone config to `MILESTONE_CONFIG`
3. Add first interaction to `FIRST_INTERACTION_CONFIG`
4. Update `recalculateAllPoints()` to include new volume field
5. Add column to users table: `cumulative_{product}_volume`

### Adding New Social Tasks
1. Insert into `tasks` table with `task_type = 'social'`
2. UI shows task → user completes → stored in `task_completions`
3. Next recalculation automatically includes it

### Adjusting Formulas
All constants are in `config.ts`:
- Change base volumes to adjust difficulty
- Change multipliers to adjust rewards
- Change quality score weights to prioritize different behaviors

### Sybil Detection (Future)
Config exists for:
- Min threshold farming detection
- Burst activity detection
- Circular transaction detection
- Self-referral detection

Currently not enforced but infrastructure ready.

---

## Appendix: Quick Reference Card

```
┌─────────────────────────────────────────────────────────────────┐
│                    XYLONET POINTS QUICK REF                     │
├─────────────────────────────────────────────────────────────────┤
│ VOLUME FORMULA: log₂(1 + vol/base) × mult                       │
│                                                                 │
│ Swap:  base=$10,  mult=5×,  cap=200/day                        │
│ Vault: base=$25,  mult=8×,  cap=100/day                        │
│ PayX:  base=$1,   mult=3×,  cap=50/day                         │
├─────────────────────────────────────────────────────────────────┤
│ QUALITY MULTIPLIER:                                             │
│ Score 0-20: 0.5×  │  41-60: 1.0×  │  81-100: 1.25×             │
│ Score 21-40: 0.75×│  61-80: 1.15× │                             │
├─────────────────────────────────────────────────────────────────┤
│ REFERRALS (per successful):                                     │
│ #1-10: 50 pts  │  #11-25: 25 pts  │  #26-50: 10 pts  │ #51+: 5 │
├─────────────────────────────────────────────────────────────────┤
│ FIRST INTERACTIONS: Swap=50, Vault=50, PayX=50 (150 total)     │
│ SOCIAL: 4 tasks × 50 = 200 total                                │
│ REFERRED BONUS: +50 if qualified ($100+ volume)                 │
└─────────────────────────────────────────────────────────────────┘
```

---

**Document maintained by:** Forge Labs  
**Contact:** forgelabs@xylonet.xyz
