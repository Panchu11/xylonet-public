const express = require('express');
const router = express.Router();
const { publicClient, walletClient, treasuryAccount, CONTRACTS, FACILITATOR_ABI, USDC_ABI } = require('../utils/arc');
const { formatUnits } = require('viem');
const { sendTransactionWithRetry } = require('../utils/transaction');

/**
 * Settler authentication middleware
 * Settlement endpoints are infrastructure-only. Regular developers use the x402 proxy.
 */
const settlerAuth = (req, res, next) => {
  const settlerKey = process.env.SETTLER_API_KEY;
  if (!settlerKey) {
    // If no key configured, block all external settle requests in production
    if (process.env.NODE_ENV === 'production') {
      return res.status(503).json({ error: 'Settlement endpoint not configured' });
    }
    return next(); // Allow in dev without key
  }

  const providedKey = req.headers['x-settler-key'];
  if (!providedKey || providedKey !== settlerKey) {
    return res.status(401).json({ error: 'Unauthorized. Valid X-Settler-Key header required.' });
  }
  next();
};

/**
 * Check treasury USDC balance and emit a warning if it falls below threshold.
 * Non-blocking — errors are swallowed so settlement flow is never interrupted.
 * @param {number} [thresholdUsd=100] - Minimum USDC balance before alert fires
 */
async function checkTreasuryBalance(thresholdUsd = 100) {
  try {
    const rawBalance = await publicClient.readContract({
      address: CONTRACTS.USDC,
      abi: USDC_ABI,
      functionName: 'balanceOf',
      args: [treasuryAccount.address]
    });
    const balanceUsd = Number(formatUnits(rawBalance, 6));
    if (balanceUsd < thresholdUsd) {
      console.warn(`[ALERT] Treasury balance low: $${balanceUsd.toFixed(2)} USDC (threshold: $${thresholdUsd}) — address: ${treasuryAccount.address}`);
    }
    return balanceUsd;
  } catch (e) {
    // Non-critical — never block settlement flow
    return null;
  }
}

/**
 * GET /v1/facilitator/status
 * Get facilitator contract status and stats
 */
router.get('/status', async (req, res) => {
  try {
    const facilitatorAddress = CONTRACTS.FACILITATOR;
    if (!facilitatorAddress) {
      return res.status(503).json({ error: 'Facilitator contract not deployed' });
    }

    const [feeBps, treasury, totalSettled, totalTransactions] = await Promise.all([
      publicClient.readContract({
        address: facilitatorAddress,
        abi: FACILITATOR_ABI,
        functionName: 'feeBps'
      }),
      publicClient.readContract({
        address: facilitatorAddress,
        abi: FACILITATOR_ABI,
        functionName: 'treasury'
      }),
      publicClient.readContract({
        address: facilitatorAddress,
        abi: FACILITATOR_ABI,
        functionName: 'totalSettled'
      }),
      publicClient.readContract({
        address: facilitatorAddress,
        abi: FACILITATOR_ABI,
        functionName: 'totalTransactions'
      })
    ]);

    res.json({
      contractAddress: facilitatorAddress,
      network: 'Arc Testnet',
      chainId: 5042002,
      feeBps: Number(feeBps),
      feePercent: Number(feeBps) / 100,
      treasury: treasury,
      totalSettled: Number(totalSettled),
      totalTransactions: Number(totalTransactions),
      usdc: CONTRACTS.USDC
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /v1/facilitator/settlement/:txHash
 * Get settlement status by transaction hash
 */
router.get('/settlement/:txHash', async (req, res) => {
  try {
    const { txHash } = req.params;
    const facilitatorAddress = CONTRACTS.FACILITATOR;

    const [settled, from, to, amount, fee, timestamp] = await publicClient.readContract({
      address: facilitatorAddress,
      abi: FACILITATOR_ABI,
      functionName: 'getSettlementStatus',
      args: [txHash]
    });

    res.json({
      txHash,
      settled,
      from,
      to,
      amount: Number(amount),
      fee: Number(fee),
      timestamp: Number(timestamp),
      amountUSD: (Number(amount) / 1e6).toFixed(6),
      feeUSD: (Number(fee) / 1e6).toFixed(6)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /v1/facilitator/settle
 * Settle an EIP-3009 gasless payment
 */
router.post('/settle', settlerAuth, async (req, res) => {
  try {
    const { from, to, value, validAfter, validBefore, nonce, v, r, s } = req.body;

    if (!from || !to || !value || !validAfter || !validBefore || !nonce || v === undefined || !r || !s) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const facilitatorAddress = CONTRACTS.FACILITATOR;

    const { hash, receipt } = await sendTransactionWithRetry(walletClient, publicClient, {
      address: facilitatorAddress,
      abi: FACILITATOR_ABI,
      functionName: 'settlePayment',
      args: [from, to, BigInt(value), BigInt(validAfter), BigInt(validBefore), nonce, v, r, s]
    });

    res.json({
      success: receipt.status === 'success',
      txHash: hash,
      blockNumber: Number(receipt.blockNumber),
      from,
      to,
      amount: Number(value),
      amountUSD: (Number(value) / 1e6).toFixed(6)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /v1/facilitator/settle-for-developer
 * Middleware delegation endpoint - allows @xylofacilitator/middleware packages
 * to delegate settlement to the backend. Developer authenticates with their API key,
 * submits the agent's EIP-3009 signature, and the backend settles on-chain.
 *
 * Auth: Developer API key (x-api-key header)
 * Body: { from, to, value, validAfter, validBefore, nonce, v, r, s, routePath }
 */
router.post('/settle-for-developer', async (req, res) => {
  try {
    const supabase = req.app.locals.supabase;

    // Authenticate developer by API key
    const apiKey = req.headers['x-api-key'];
    if (!apiKey) {
      return res.status(401).json({ error: 'x-api-key header required' });
    }

    const crypto = require('crypto');
    const hashedKey = crypto.createHash('sha256').update(apiKey).digest('hex');
    const { data: developer } = await supabase
      .from('xf_developers')
      .select('*')
      .eq('api_key', hashedKey)
      .single();

    if (!developer) {
      return res.status(401).json({ error: 'Invalid API key' });
    }

    const { from, to, value, validAfter, validBefore, nonce, v, r, s, routePath } = req.body;

    if (!from || !to || !value || !validAfter || !validBefore || !nonce || v === undefined || !r || !s) {
      return res.status(400).json({ error: 'Missing required EIP-3009 fields: from, to, value, validAfter, validBefore, nonce, v, r, s' });
    }

    // Verify payment is directed to the facilitator contract
    const facilitatorAddress = CONTRACTS.FACILITATOR;
    if (to.toLowerCase() !== facilitatorAddress.toLowerCase()) {
      return res.status(400).json({
        error: 'Payment recipient must be the facilitator contract',
        expected: facilitatorAddress,
        provided: to
      });
    }

    // Settle on-chain
    const { hash: settleHash, receipt } = await sendTransactionWithRetry(walletClient, publicClient, {
      address: facilitatorAddress,
      abi: FACILITATOR_ABI,
      functionName: 'settlePayment',
      args: [
        from,
        developer.wallet_address, // Developer receives net amount
        BigInt(value),
        BigInt(validAfter),
        BigInt(validBefore),
        nonce,
        v,
        r,
        s
      ]
    });

    if (receipt.status !== 'success') {
      return res.status(500).json({ error: 'Settlement transaction failed', txHash: settleHash });
    }

    // Record in DB
    const feeUsd = (Number(value) / 1e6) * (Number(process.env.FACILITATOR_FEE_BPS || 100) / 10000);
    await supabase.from('xf_settlements').insert({
      tx_hash: settleHash,
      from_address: from,
      to_address: to,
      amount_usd: Number(value) / 1e6,
      fee_usd: feeUsd,
      developer_id: developer.id,
      route_id: null, // Middleware-delegated settlements may not have a route
      status: 'confirmed',
      block_number: Number(receipt.blockNumber),
      eip3009_nonce: nonce,
      settled_at: new Date().toISOString()
    });

    // Check treasury balance after settlement (non-blocking)
    await checkTreasuryBalance();

    res.json({
      success: true,
      txHash: settleHash,
      blockNumber: Number(receipt.blockNumber),
      from,
      to: developer.wallet_address,
      amount: Number(value),
      amountUSD: (Number(value) / 1e6).toFixed(6),
      feeUSD: feeUsd.toFixed(6)
    });
  } catch (error) {
    console.error(`[SETTLE-FOR-DEV] requestId=${req.requestId} Error:`, error.message);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /v1/facilitator/settle-direct
 * Settle a direct USDC payment (for Circle developer-controlled wallets)
 */
router.post('/settle-direct', settlerAuth, async (req, res) => {
  try {
    const { from, to, value } = req.body;

    if (!from || !to || !value) {
      return res.status(400).json({ error: 'Missing required fields: from, to, value' });
    }

    const facilitatorAddress = CONTRACTS.FACILITATOR;

    const { hash, receipt } = await sendTransactionWithRetry(walletClient, publicClient, {
      address: facilitatorAddress,
      abi: FACILITATOR_ABI,
      functionName: 'settleDirect',
      args: [from, to, BigInt(value)]
    });

    res.json({
      success: receipt.status === 'success',
      txHash: hash,
      blockNumber: Number(receipt.blockNumber),
      from,
      to,
      amount: Number(value),
      amountUSD: (Number(value) / 1e6).toFixed(6)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
