// @ts-nocheck
// Envio Cloud runs codegen at build time; local types are unavailable
import { indexer } from "envio";

// Helper: get YYYY-MM-DD date string from block timestamp (seconds)
function getDateId(timestamp: bigint): string {
  const date = new Date(Number(timestamp) * 1000);
  return date.toISOString().split("T")[0]!;
}

// Helper: get or initialize a DailyVolume entity
async function getOrCreateDailyVolume(context: any, timestamp: bigint) {
  const dateId = getDateId(timestamp);
  let daily = await context.DailyVolume.get(dateId);
  if (!daily) {
    daily = {
      id: dateId,
      date: dateId,
      swapVolume: 0n,
      vaultDeposits: 0n,
      vaultWithdrawals: 0n,
      tipVolume: 0n,
      swapCount: 0n,
      depositCount: 0n,
      withdrawCount: 0n,
      tipCount: 0n,
    };
  }
  return daily;
}

// Helper: get or initialize a PoolDailyVolume entity (per-pool daily aggregates)
// Powers accurate 24h / 7d pool volumes on the analytics page without
// paginating raw Swap rows.
async function getOrCreatePoolDailyVolume(
  context: any,
  poolAddress: string,
  timestamp: bigint
) {
  const dateId = getDateId(timestamp);
  const id = `${poolAddress}-${dateId}`;
  let daily = await context.PoolDailyVolume.get(id);
  if (!daily) {
    daily = {
      id,
      pool: poolAddress,
      date: dateId,
      volume: 0n,
      txCount: 0n,
    };
  }
  return daily;
}

// Helper: get or initialize the ProtocolStats entity (lifetime aggregates)
async function getOrCreateProtocolStats(context: any): Promise<any> {
  let stats = await context.ProtocolStats.get("global");
  if (!stats) {
    stats = {
      id: "global",
      totalUsers: 0n,
      totalSwaps: 0n,
      totalTips: 0n,
      totalFeeRevenue: 0n,
      totalSwapVolume: 0n,
      totalTipVolume: 0n,
      totalVaultDeposits: 0n,
      totalVaultWithdrawals: 0n,
      lastUpdated: 0n,
    };
  }
  return stats;
}

// Helper: get or initialize a ProtocolUser entity
async function getOrCreateUser(context: any, address: string, timestamp: bigint) {
  let user = await context.ProtocolUser.get(address);
  if (!user) {
    user = {
      id: address,
      address: address,
      swapCount: 0n,
      liquidityCount: 0n,
      vaultCount: 0n,
      tipCount: 0n,
      totalSwapVolume: 0n,
      firstSeenAt: timestamp,
      lastSeenAt: timestamp,
    };
    // New user — increment totalUsers in ProtocolStats
    const stats = await getOrCreateProtocolStats(context);
    stats.totalUsers += 1n;
    stats.lastUpdated = timestamp;
    context.ProtocolStats.set(stats);
  }
  return user;
}

// ═══════════════════════════════════════════════════════
// XyloPoolUsdcEurc — Swap
// ═══════════════════════════════════════════════════════

indexer.onEvent(
  { contract: "XyloPoolUsdcEurc", event: "Swap" },
  async ({ event, context }) => {
    const id = `${event.transaction.hash}-${event.logIndex}`;
    const poolAddress = event.srcAddress;
    const timestamp = BigInt(event.block.timestamp);

    // Create Swap entity
    context.Swap.set({
      id,
      pool: poolAddress,
      sender: event.params.sender,
      tokenIn: event.params.tokenIn,
      tokenOut: event.params.tokenOut,
      amountIn: event.params.amountIn,
      amountOut: event.params.amountOut,
      to: event.params.to,
      timestamp,
      blockNumber: BigInt(event.block.number),
      txHash: event.transaction.hash,
    });

    // Update Pool entity
    const poolId = poolAddress;
    let pool = await context.Pool.get(poolId);
    if (!pool) {
      pool = {
        id: poolId,
        address: poolAddress,
        token0: event.params.tokenIn,
        token1: event.params.tokenOut,
        totalVolume: 0n,
        txCount: 0n,
      };
    }
    pool.totalVolume += event.params.amountIn;
    pool.txCount += 1n;
    context.Pool.set(pool);

    // Update DailyVolume
    const daily = await getOrCreateDailyVolume(context, timestamp);
    daily.swapVolume += event.params.amountIn;
    daily.swapCount += 1n;
    context.DailyVolume.set(daily);

    // Update PoolDailyVolume (per-pool daily aggregate)
    const poolDaily = await getOrCreatePoolDailyVolume(
      context,
      poolAddress,
      timestamp
    );
    poolDaily.volume += event.params.amountIn;
    poolDaily.txCount += 1n;
    context.PoolDailyVolume.set(poolDaily);

    // Update ProtocolUser
    const user = await getOrCreateUser(context, event.params.sender, timestamp);
    user.swapCount += 1n;
    user.totalSwapVolume += event.params.amountIn;
    user.lastSeenAt = timestamp;
    context.ProtocolUser.set(user);

    // Update ProtocolStats
    const stats = await getOrCreateProtocolStats(context);
    stats.totalSwaps += 1n;
    stats.totalSwapVolume += event.params.amountIn;
    stats.lastUpdated = timestamp;
    context.ProtocolStats.set(stats);
  }
);

// ═══════════════════════════════════════════════════════
// XyloPoolUsdcUsyc — Swap
// ═══════════════════════════════════════════════════════

indexer.onEvent(
  { contract: "XyloPoolUsdcUsyc", event: "Swap" },
  async ({ event, context }) => {
    const id = `${event.transaction.hash}-${event.logIndex}`;
    const poolAddress = event.srcAddress;
    const timestamp = BigInt(event.block.timestamp);

    context.Swap.set({
      id,
      pool: poolAddress,
      sender: event.params.sender,
      tokenIn: event.params.tokenIn,
      tokenOut: event.params.tokenOut,
      amountIn: event.params.amountIn,
      amountOut: event.params.amountOut,
      to: event.params.to,
      timestamp,
      blockNumber: BigInt(event.block.number),
      txHash: event.transaction.hash,
    });

    const poolId = poolAddress;
    let pool = await context.Pool.get(poolId);
    if (!pool) {
      pool = {
        id: poolId,
        address: poolAddress,
        token0: event.params.tokenIn,
        token1: event.params.tokenOut,
        totalVolume: 0n,
        txCount: 0n,
      };
    }
    pool.totalVolume += event.params.amountIn;
    pool.txCount += 1n;
    context.Pool.set(pool);

    const daily = await getOrCreateDailyVolume(context, timestamp);
    daily.swapVolume += event.params.amountIn;
    daily.swapCount += 1n;
    context.DailyVolume.set(daily);

    // Update PoolDailyVolume (per-pool daily aggregate)
    const poolDaily = await getOrCreatePoolDailyVolume(
      context,
      poolAddress,
      timestamp
    );
    poolDaily.volume += event.params.amountIn;
    poolDaily.txCount += 1n;
    context.PoolDailyVolume.set(poolDaily);

    const user = await getOrCreateUser(context, event.params.sender, timestamp);
    user.swapCount += 1n;
    user.totalSwapVolume += event.params.amountIn;
    user.lastSeenAt = timestamp;
    context.ProtocolUser.set(user);

    // Update ProtocolStats
    const stats = await getOrCreateProtocolStats(context);
    stats.totalSwaps += 1n;
    stats.totalSwapVolume += event.params.amountIn;
    stats.lastUpdated = timestamp;
    context.ProtocolStats.set(stats);
  }
);

// ═══════════════════════════════════════════════════════
// XyloPoolUsdcEurc — AddLiquidity
// ═══════════════════════════════════════════════════════

indexer.onEvent(
  { contract: "XyloPoolUsdcEurc", event: "AddLiquidity" },
  async ({ event, context }) => {
    const id = `${event.transaction.hash}-${event.logIndex}`;
    const timestamp = BigInt(event.block.timestamp);

    context.LiquidityEvent.set({
      id,
      pool: event.srcAddress,
      provider: event.params.provider,
      eventType: "add",
      amounts: event.params.amounts.map((a: bigint) => a),
      lpTokens: event.params.lpTokens,
      timestamp,
      blockNumber: BigInt(event.block.number),
      txHash: event.transaction.hash,
    });

    const user = await getOrCreateUser(context, event.params.provider, timestamp);
    user.liquidityCount += 1n;
    user.lastSeenAt = timestamp;
    context.ProtocolUser.set(user);
  }
);

// ═══════════════════════════════════════════════════════
// XyloPoolUsdcUsyc — AddLiquidity
// ═══════════════════════════════════════════════════════

indexer.onEvent(
  { contract: "XyloPoolUsdcUsyc", event: "AddLiquidity" },
  async ({ event, context }) => {
    const id = `${event.transaction.hash}-${event.logIndex}`;
    const timestamp = BigInt(event.block.timestamp);

    context.LiquidityEvent.set({
      id,
      pool: event.srcAddress,
      provider: event.params.provider,
      eventType: "add",
      amounts: event.params.amounts.map((a: bigint) => a),
      lpTokens: event.params.lpTokens,
      timestamp,
      blockNumber: BigInt(event.block.number),
      txHash: event.transaction.hash,
    });

    const user = await getOrCreateUser(context, event.params.provider, timestamp);
    user.liquidityCount += 1n;
    user.lastSeenAt = timestamp;
    context.ProtocolUser.set(user);
  }
);

// ═══════════════════════════════════════════════════════
// XyloPoolUsdcEurc — RemoveLiquidity
// ═══════════════════════════════════════════════════════

indexer.onEvent(
  { contract: "XyloPoolUsdcEurc", event: "RemoveLiquidity" },
  async ({ event, context }) => {
    const id = `${event.transaction.hash}-${event.logIndex}`;
    const timestamp = BigInt(event.block.timestamp);

    context.LiquidityEvent.set({
      id,
      pool: event.srcAddress,
      provider: event.params.provider,
      eventType: "remove",
      amounts: event.params.amounts.map((a: bigint) => a),
      lpTokens: event.params.lpTokens,
      timestamp,
      blockNumber: BigInt(event.block.number),
      txHash: event.transaction.hash,
    });

    const user = await getOrCreateUser(context, event.params.provider, timestamp);
    user.liquidityCount += 1n;
    user.lastSeenAt = timestamp;
    context.ProtocolUser.set(user);
  }
);

// ═══════════════════════════════════════════════════════
// XyloPoolUsdcUsyc — RemoveLiquidity
// ═══════════════════════════════════════════════════════

indexer.onEvent(
  { contract: "XyloPoolUsdcUsyc", event: "RemoveLiquidity" },
  async ({ event, context }) => {
    const id = `${event.transaction.hash}-${event.logIndex}`;
    const timestamp = BigInt(event.block.timestamp);

    context.LiquidityEvent.set({
      id,
      pool: event.srcAddress,
      provider: event.params.provider,
      eventType: "remove",
      amounts: event.params.amounts.map((a: bigint) => a),
      lpTokens: event.params.lpTokens,
      timestamp,
      blockNumber: BigInt(event.block.number),
      txHash: event.transaction.hash,
    });

    const user = await getOrCreateUser(context, event.params.provider, timestamp);
    user.liquidityCount += 1n;
    user.lastSeenAt = timestamp;
    context.ProtocolUser.set(user);
  }
);

// ═══════════════════════════════════════════════════════
// XyloPoolUsdcEurc — RemoveLiquidityOne
// ═══════════════════════════════════════════════════════

indexer.onEvent(
  { contract: "XyloPoolUsdcEurc", event: "RemoveLiquidityOne" },
  async ({ event, context }) => {
    const id = `${event.transaction.hash}-${event.logIndex}`;
    const timestamp = BigInt(event.block.timestamp);

    context.LiquidityEvent.set({
      id,
      pool: event.srcAddress,
      provider: event.params.provider,
      eventType: "removeOne",
      amounts: [event.params.amount],
      lpTokens: event.params.lpTokens,
      timestamp,
      blockNumber: BigInt(event.block.number),
      txHash: event.transaction.hash,
    });

    const user = await getOrCreateUser(context, event.params.provider, timestamp);
    user.liquidityCount += 1n;
    user.lastSeenAt = timestamp;
    context.ProtocolUser.set(user);
  }
);

// ═══════════════════════════════════════════════════════
// XyloPoolUsdcUsyc — RemoveLiquidityOne
// ═══════════════════════════════════════════════════════

indexer.onEvent(
  { contract: "XyloPoolUsdcUsyc", event: "RemoveLiquidityOne" },
  async ({ event, context }) => {
    const id = `${event.transaction.hash}-${event.logIndex}`;
    const timestamp = BigInt(event.block.timestamp);

    context.LiquidityEvent.set({
      id,
      pool: event.srcAddress,
      provider: event.params.provider,
      eventType: "removeOne",
      amounts: [event.params.amount],
      lpTokens: event.params.lpTokens,
      timestamp,
      blockNumber: BigInt(event.block.number),
      txHash: event.transaction.hash,
    });

    const user = await getOrCreateUser(context, event.params.provider, timestamp);
    user.liquidityCount += 1n;
    user.lastSeenAt = timestamp;
    context.ProtocolUser.set(user);
  }
);

// ═══════════════════════════════════════════════════════
// XyloVault — Deposit
// ═══════════════════════════════════════════════════════

indexer.onEvent(
  { contract: "XyloVault", event: "Deposit" },
  async ({ event, context }) => {
    const id = `${event.transaction.hash}-${event.logIndex}`;
    const timestamp = BigInt(event.block.timestamp);

    context.VaultEvent.set({
      id,
      caller: event.params.caller,
      owner: event.params.owner,
      assets: event.params.assets,
      shares: event.params.shares,
      eventType: "deposit",
      timestamp,
      blockNumber: BigInt(event.block.number),
      txHash: event.transaction.hash,
    });

    // Update DailyVolume
    const daily = await getOrCreateDailyVolume(context, timestamp);
    daily.vaultDeposits += event.params.assets;
    daily.depositCount += 1n;
    context.DailyVolume.set(daily);

    // Update ProtocolUser
    const user = await getOrCreateUser(context, event.params.caller, timestamp);
    user.vaultCount += 1n;
    user.lastSeenAt = timestamp;
    context.ProtocolUser.set(user);

    // Update ProtocolStats
    const stats = await getOrCreateProtocolStats(context);
    stats.totalVaultDeposits += event.params.assets;
    stats.lastUpdated = timestamp;
    context.ProtocolStats.set(stats);
  }
);

// ═══════════════════════════════════════════════════════
// XyloVault — Withdraw
// ═══════════════════════════════════════════════════════

indexer.onEvent(
  { contract: "XyloVault", event: "Withdraw" },
  async ({ event, context }) => {
    const id = `${event.transaction.hash}-${event.logIndex}`;
    const timestamp = BigInt(event.block.timestamp);

    context.VaultEvent.set({
      id,
      caller: event.params.caller,
      owner: event.params.owner,
      assets: event.params.assets,
      shares: event.params.shares,
      eventType: "withdraw",
      timestamp,
      blockNumber: BigInt(event.block.number),
      txHash: event.transaction.hash,
    });

    // Update DailyVolume
    const daily = await getOrCreateDailyVolume(context, timestamp);
    daily.vaultWithdrawals += event.params.assets;
    daily.withdrawCount += 1n;
    context.DailyVolume.set(daily);

    // Update ProtocolUser
    const user = await getOrCreateUser(context, event.params.caller, timestamp);
    user.vaultCount += 1n;
    user.lastSeenAt = timestamp;
    context.ProtocolUser.set(user);

    // Update ProtocolStats
    const stats = await getOrCreateProtocolStats(context);
    stats.totalVaultWithdrawals += event.params.assets;
    stats.lastUpdated = timestamp;
    context.ProtocolStats.set(stats);
  }
);

// ═══════════════════════════════════════════════════════
// PayXTipping — TipSent
// ═══════════════════════════════════════════════════════

indexer.onEvent(
  { contract: "PayXTipping", event: "TipSent" },
  async ({ event, context }) => {
    const id = `${event.transaction.hash}-${event.logIndex}`;
    const timestamp = BigInt(event.block.timestamp);

    context.Tip.set({
      id,
      handleHash: event.params.handleHash,
      handle: event.params.handle,
      tipper: event.params.tipper,
      amount: event.params.amount,
      fee: event.params.fee,
      message: event.params.message,
      timestamp,
      blockNumber: BigInt(event.block.number),
      txHash: event.transaction.hash,
    });

    // Update DailyVolume
    const daily = await getOrCreateDailyVolume(context, timestamp);
    daily.tipVolume += event.params.amount;
    daily.tipCount += 1n;
    context.DailyVolume.set(daily);

    // Update ProtocolUser
    const user = await getOrCreateUser(context, event.params.tipper, timestamp);
    user.tipCount += 1n;
    user.lastSeenAt = timestamp;
    context.ProtocolUser.set(user);

    // Update ProtocolStats
    const stats = await getOrCreateProtocolStats(context);
    stats.totalTips += 1n;
    stats.totalTipVolume += event.params.amount;
    stats.totalFeeRevenue += event.params.fee;
    stats.lastUpdated = timestamp;
    context.ProtocolStats.set(stats);
  }
);

// ═══════════════════════════════════════════════════════
// PayXTipping — TipsClaimed
// ═══════════════════════════════════════════════════════

indexer.onEvent(
  { contract: "PayXTipping", event: "TipsClaimed" },
  async ({ event, context }) => {
    const id = `${event.transaction.hash}-${event.logIndex}`;
    const timestamp = BigInt(event.block.timestamp);

    context.TipClaim.set({
      id,
      handleHash: event.params.handleHash,
      handle: event.params.handle,
      wallet: event.params.wallet,
      amount: event.params.amount,
      timestamp,
      blockNumber: BigInt(event.block.number),
      txHash: event.transaction.hash,
    });
  }
);

// ═══════════════════════════════════════════════════════
// XyloFactory — PoolCreated
// ═══════════════════════════════════════════════════════

indexer.onEvent(
  { contract: "XyloFactory", event: "PoolCreated" },
  async ({ event, context }) => {
    const poolAddress = event.params.pool;

    context.Pool.set({
      id: poolAddress,
      address: poolAddress,
      token0: event.params.token0,
      token1: event.params.token1,
      totalVolume: 0n,
      txCount: 0n,
    });
  }
);
