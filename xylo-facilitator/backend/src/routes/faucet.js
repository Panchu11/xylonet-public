const express = require('express');
const router = express.Router();
const { publicClient, walletClient, CONTRACTS, USDC_ABI, settlementAccount } = require('../utils/arc');
const { getDynamicGasPrice } = require('../utils/transaction');

// Rate limit: 1 request per address ever (enforced by DB unique constraint)
// Plus IP-based rate limit: max 5 faucet calls per IP per hour
const ipRateLimit = new Map();
const IP_LIMIT = 5;
const IP_WINDOW = 60 * 60 * 1000; // 1 hour

function checkIpRate(ip) {
  const now = Date.now();
  const entry = ipRateLimit.get(ip);
  if (!entry || now - entry.windowStart > IP_WINDOW) {
    ipRateLimit.set(ip, { windowStart: now, count: 1 });
    return true;
  }
  if (entry.count >= IP_LIMIT) return false;
  entry.count++;
  return true;
}

// Cleanup stale IP entries every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of ipRateLimit) {
    if (now - entry.windowStart > IP_WINDOW) ipRateLimit.delete(ip);
  }
}, 10 * 60 * 1000);

const FAUCET_AMOUNT = 10_000_000n; // 10 USDC (6 decimals)

/**
 * POST /v1/agent/faucet
 * Seed a new agent wallet with 10 USDC on testnet.
 * Body: { address: "0x..." }
 * One-time per address. Funded from settlement wallet.
 */
router.post('/faucet', async (req, res) => {
  try {
    const { address } = req.body;

    if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
      return res.status(400).json({ error: 'Valid Ethereum address required' });
    }

    const agentAddress = address.toLowerCase();
    const supabase = req.app.locals.supabase;
    const clientIp = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip;

    // IP rate limit
    if (!checkIpRate(clientIp)) {
      return res.status(429).json({
        error: 'Too many faucet requests from this IP. Max 5 per hour.',
        retryAfterSeconds: 3600
      });
    }

    // Check if already funded
    const { data: existing, error: checkError } = await supabase
      .from('xf_agent_seeds')
      .select('id, tx_hash, funded_at')
      .eq('agent_address', agentAddress)
      .single();

    if (checkError && checkError.message && checkError.message.includes('xf_agent_seeds')) {
      return res.status(503).json({ error: 'Faucet not yet initialized. Run supabase-migration-002.sql.' });
    }

    if (existing) {
      return res.status(409).json({
        error: 'Address already funded',
        txHash: existing.tx_hash,
        fundedAt: existing.funded_at,
        amount: '10.000000'
      });
    }

    // Check settlement wallet balance
    const balance = await publicClient.readContract({
      address: CONTRACTS.USDC,
      abi: USDC_ABI,
      functionName: 'balanceOf',
      args: [settlementAccount.address]
    });

    if (balance < FAUCET_AMOUNT) {
      return res.status(503).json({
        error: 'Faucet temporarily unavailable. Insufficient funds.',
      });
    }

    // Transfer 10 USDC to agent
    const gasPrice = await getDynamicGasPrice(publicClient);
    const hash = await walletClient.writeContract({
      address: CONTRACTS.USDC,
      abi: USDC_ABI,
      functionName: 'transfer',
      args: [agentAddress, FAUCET_AMOUNT],
      gasPrice
    });

    const receipt = await publicClient.waitForTransactionReceipt({ hash });

    if (receipt.status !== 'success') {
      return res.status(500).json({ error: 'Transfer transaction failed', txHash: hash });
    }

    // Record in DB
    await supabase.from('xf_agent_seeds').insert({
      agent_address: agentAddress,
      amount_usdc: 10.0,
      tx_hash: hash,
      ip_address: clientIp
    });

    res.json({
      success: true,
      txHash: hash,
      amount: '10.000000',
      asset: 'USDC',
      network: 'Arc Testnet',
      recipient: agentAddress,
      blockNumber: Number(receipt.blockNumber)
    });
  } catch (error) {
    console.error('[FAUCET] Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /v1/agent/faucet/status/:address
 * Check if an address has been funded
 */
router.get('/faucet/status/:address', async (req, res) => {
  try {
    const { address } = req.params;
    if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
      return res.status(400).json({ error: 'Valid Ethereum address required' });
    }

    const supabase = req.app.locals.supabase;
    const { data, error } = await supabase
      .from('xf_agent_seeds')
      .select('agent_address, amount_usdc, tx_hash, funded_at')
      .eq('agent_address', address.toLowerCase())
      .single();

    if (error) {
      // Table may not exist yet
      if (error.message && error.message.includes('xf_agent_seeds')) {
        return res.status(503).json({ error: 'Faucet not yet initialized. Run supabase-migration-002.sql.' });
      }
      // PGRST116 = no rows found, which is fine
      if (error.code === 'PGRST116') {
        return res.json({ funded: false, address: address.toLowerCase() });
      }
      return res.status(500).json({ error: error.message });
    }

    if (!data) {
      return res.json({ funded: false, address: address.toLowerCase() });
    }

    res.json({
      funded: true,
      address: data.agent_address,
      amount: data.amount_usdc,
      txHash: data.tx_hash,
      fundedAt: data.funded_at
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
