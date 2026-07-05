const express = require('express');
const router = express.Router();
const { publicClient, walletClient, treasuryAccount, CONTRACTS, FACILITATOR_ABI, USDC_ABI } = require('../utils/arc');
const { formatUnits } = require('viem');
const { checkRateLimit } = require('./rate-limit');
const { deliverWebhook } = require('../services/webhooks');
const { sendTransactionWithRetry } = require('../utils/transaction');

/**
 * x402 Payment Proxy Middleware
 * 
 * When an AI agent sends a request with an x402 payment header,
 * this middleware:
 * 1. Decodes the EIP-3009 authorization from the header
 * 2. Verifies the payment matches the route price
 * 3. Settles the payment via XyloFacilitator
 * 4. Forwards the request to the target API
 * 5. Returns the response to the agent
 */

// x402 payment header parser
function parseX402Payment(authHeader) {
  if (!authHeader || !authHeader.startsWith('x402 ')) {
    return null;
  }

  try {
    const payload = authHeader.slice(5); // Remove "x402 "
    const decoded = JSON.parse(Buffer.from(payload, 'base64').toString());

    return {
      from: decoded.from,
      to: decoded.to,
      value: decoded.value,
      validAfter: decoded.validAfter,
      validBefore: decoded.validBefore,
      nonce: decoded.nonce,
      signature: {
        v: decoded.v,
        r: decoded.r,
        s: decoded.s
      }
    };
  } catch {
    return null;
  }
}

/**
 * ALL /v1/proxy/:routePath
 * x402 payment proxy - handles payment then forwards to target
 */
router.all('/*path', async (req, res) => {
  const supabase = req.app.locals.supabase;
  const routePath = req.params.path;

  // Helper: check treasury USDC balance and warn if low (non-blocking)
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
    } catch {
      return null;
    }
  }

  // 1. Look up the route
  const { data: routes, error } = await supabase
    .from('xf_api_routes')
    .select('*, xf_developers!inner(*)')
    .eq('route_path', routePath)
    .eq('is_active', true)
    .limit(1);

  if (error) {
    return res.status(500).json({ error: 'Internal error', code: 'DB_ERROR' });
  }

  if (!routes || routes.length === 0) {
    return res.status(404).json({
      error: 'Route not found',
      code: 'ROUTE_NOT_FOUND',
      path: routePath,
      message: 'No active API route registered for this path'
    });
  }

  const route = routes[0];
  const priceInUnits = Math.floor(route.price_usd * 1e6); // Convert to USDC units

  // 2. Rate limit check (per developer)
  const devLimit = route.xf_developers.rate_limit_rpm || 60;
  const rateLimit = checkRateLimit(route.developer_id, devLimit);
  if (!rateLimit.allowed) {
    res.setHeader('X-RateLimit-Limit', String(devLimit));
    res.setHeader('X-RateLimit-Remaining', '0');
    res.setHeader('Retry-After', String(rateLimit.retryAfter));
    return res.status(429).json({
      error: 'Rate limit exceeded',
      retryAfterSeconds: rateLimit.retryAfter
    });
  }

  // Set per-developer rate limit headers on every successful response
  res.setHeader('X-RateLimit-Limit', String(rateLimit.limit));
  res.setHeader('X-RateLimit-Remaining', String(rateLimit.remaining));

  // 3. Check for payment header
  const authHeader = req.headers['x-payment'] || req.headers['authorization'];
  const payment = parseX402Payment(authHeader);

  if (!payment) {
    // Return 402 with payment requirements
    // Agent must sign EIP-3009 transfer TO the facilitator contract
    // (the contract then distributes: net to developer, fee to treasury)
    return res.status(402).json({
      error: 'Payment Required',
      code: 'PAYMENT_REQUIRED',
      x402Version: '1',
      acceptances: [{
        paymentType: 'x402-eip3009',
        scheme: 'https',
        network: '5042002',
        asset: CONTRACTS.USDC,
        amount: String(priceInUnits),
        recipient: CONTRACTS.FACILITATOR,
        developer: route.xf_developers.wallet_address,
        description: `Payment for ${route.method} ${route.route_path}: $${route.price_usd} USDC`
      }]
    });
  }

  // 4. Verify payment amount matches route price
  if (BigInt(payment.value) < BigInt(priceInUnits)) {
    return res.status(402).json({
      error: 'Insufficient Payment',
      code: 'INSUFFICIENT_PAYMENT',
      required: String(priceInUnits),
      provided: String(payment.value),
      nonce: payment.nonce,
      acceptances: [{
        paymentType: 'x402-eip3009',
        scheme: 'https',
        network: '5042002',
        asset: CONTRACTS.USDC,
        amount: String(priceInUnits),
        recipient: CONTRACTS.FACILITATOR
      }]
    });
  }

  // 4b. Verify payment is directed to the facilitator contract
  if (payment.to.toLowerCase() !== CONTRACTS.FACILITATOR.toLowerCase()) {
    return res.status(402).json({
      error: 'Invalid payment recipient. Must be the facilitator contract.',
      code: 'INVALID_PAYMENT_RECIPIENT',
      expected: CONTRACTS.FACILITATOR,
      provided: payment.to,
      nonce: payment.nonce
    });
  }

  // 5. Settle payment via XyloFacilitator
  try {
    const facilitatorAddress = CONTRACTS.FACILITATOR;
    // `to` arg = developer wallet (receives net amount after fee)
    // The EIP-3009 signature is verified against address(this) inside the contract
    const { hash: settleHash, receipt } = await sendTransactionWithRetry(walletClient, publicClient, {
      address: facilitatorAddress,
      abi: FACILITATOR_ABI,
      functionName: 'settlePayment',
      args: [
        payment.from,
        route.xf_developers.wallet_address,
        BigInt(payment.value),
        BigInt(payment.validAfter),
        BigInt(payment.validBefore),
        payment.nonce,
        payment.signature.v,
        payment.signature.r,
        payment.signature.s
      ]
    });

    if (receipt.status !== 'success') {
      return res.status(402).json({
        error: 'Payment settlement failed',
        code: 'SETTLEMENT_FAILED',
        txHash: settleHash,
        nonce: payment.nonce
      });
    }

    // Structured settlement success log
    console.log(JSON.stringify({
      event: 'settlement.success',
      txHash: settleHash,
      amount: Number(payment.value) / 1e6,
      developer: route.developer_id,
      route: route.route_path,
      requestId: req.requestId,
      timestamp: new Date().toISOString()
    }));

    // 6. Record settlement in Supabase
    const feeUsd = (Number(payment.value) / 1e6) * (Number(process.env.FACILITATOR_FEE_BPS || 100) / 10000);
    await supabase.from('xf_settlements').insert({
      tx_hash: settleHash,
      from_address: payment.from,
      to_address: payment.to,
      amount_usd: Number(payment.value) / 1e6,
      fee_usd: feeUsd,
      developer_id: route.developer_id,
      route_id: route.id,
      status: 'confirmed',
      block_number: Number(receipt.blockNumber),
      eip3009_nonce: payment.nonce,
      settled_at: new Date().toISOString()
    });

    // Update route stats
    await supabase.from('xf_api_routes')
      .update({
        total_calls: route.total_calls + 1,
        total_revenue_usd: Number(route.total_revenue_usd || 0) + Number(payment.value) / 1e6
      })
      .eq('id', route.id);

    // Check treasury balance after settlement (non-blocking)
    await checkTreasuryBalance();

    // 7. Fire webhook (non-blocking)
    deliverWebhook(supabase, route.developer_id, 'payment.settled', {
      txHash: settleHash,
      from: payment.from,
      to: payment.to,
      amount_usd: Number(payment.value) / 1e6,
      fee_usd: feeUsd,
      route_path: route.route_path,
      block_number: Number(receipt.blockNumber)
    });

    // 8. Forward request to target API
    try {
      const targetUrl = new URL(route.target_url);
      const forwardHeaders = { ...req.headers };
      delete forwardHeaders['x-payment'];
      delete forwardHeaders['authorization'];
      delete forwardHeaders['host'];

      const fetchOptions = {
        method: req.method,
        headers: forwardHeaders
      };

      if (req.method !== 'GET' && req.method !== 'HEAD') {
        fetchOptions.body = JSON.stringify(req.body);
      }

      const targetResponse = await fetch(targetUrl.toString(), fetchOptions);
      const responseData = await targetResponse.text();

      // Set payment receipt header
      res.setHeader('X-Payment-Receipt', settleHash);
      res.setHeader('X-Payment-Amount', String(payment.value));
      res.setHeader('X-Payment-Asset', CONTRACTS.USDC);

      res.status(targetResponse.status).send(responseData);
    } catch (fetchError) {
      // Payment was settled but target API failed
      console.error(`[x402 Proxy] requestId=${req.requestId} Target API fetch failed after settlement:`, fetchError.message);
      res.status(502).json({
        error: 'target_api_unavailable',
        message: 'Payment was settled successfully but the target API is unreachable',
        settlement: {
          txHash: settleHash,
          status: 'settled'
        }
      });
    }
  } catch (settleError) {
    // Structured settlement failure log
    console.log(JSON.stringify({
      event: 'settlement.failed',
      error: settleError.message,
      developer: route?.developer_id,
      route: routePath,
      requestId: req.requestId,
      timestamp: new Date().toISOString()
    }));
    console.error(`[x402 Proxy] requestId=${req.requestId} Payment settlement failed:`, settleError.message);
    res.status(402).json({
      error: 'Payment settlement failed',
      code: 'SETTLEMENT_FAILED',
      details: 'Settlement transaction could not be completed',
      nonce: payment.nonce
    });
  }
});

module.exports = router;
