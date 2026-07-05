const express = require('express');
const router = express.Router();
const { publicClient, settlementAccount, treasuryAccount, CONTRACTS, USDC_ABI, arcTestnet } = require('../utils/arc');
const { formatEther, formatUnits } = require('viem');

/**
 * GET /health/detailed
 * Detailed health check — DB connectivity, wallet balances, settlement stats, alerts
 */
router.get('/detailed', async (req, res) => {
  const supabase = req.app.locals.supabase;
  const result = {
    db: false,
    settlementWallet: null,
    treasuryBalance: null,
    treasuryBalanceUsdc: null,
    lastSettlement: null,
    settlementsLastHour: 0,
    alerts: [],
    uptime: process.uptime(),
    chainId: arcTestnet.id
  };

  // 1. DB connectivity check
  try {
    if (supabase) {
      const { error } = await supabase.from('xf_settlements').select('id', { head: true }).limit(1);
      result.db = !error;
    }
  } catch {
    result.db = false;
  }

  // 2. Settlement wallet address + ETH balance (for gas)
  try {
    const address = settlementAccount.address;
    const balanceWei = await publicClient.getBalance({ address });
    result.settlementWallet = {
      address,
      balanceEth: formatEther(balanceWei)
    };
    // Alert if gas balance is critically low (< 0.01 ETH)
    const ethBalance = Number(formatEther(balanceWei));
    if (ethBalance < 0.01) {
      result.alerts.push(`Settlement wallet gas critically low: ${ethBalance.toFixed(6)} ETH`);
    }
  } catch (e) {
    result.settlementWallet = { address: settlementAccount.address, balanceEth: 'unknown', error: e.message };
  }

  // 2b. Treasury wallet USDC balance
  try {
    const treasuryAddress = treasuryAccount.address;
    const [ethBalWei, usdcRaw] = await Promise.all([
      publicClient.getBalance({ address: treasuryAddress }),
      publicClient.readContract({
        address: CONTRACTS.USDC,
        abi: USDC_ABI,
        functionName: 'balanceOf',
        args: [treasuryAddress]
      })
    ]);
    result.treasuryBalance = {
      address: treasuryAddress,
      balanceEth: formatEther(ethBalWei)
    };
    const usdcBalance = Number(formatUnits(usdcRaw, 6));
    result.treasuryBalanceUsdc = usdcBalance;
    if (usdcBalance < 100) {
      result.alerts.push(`Treasury balance low: $${usdcBalance.toFixed(2)} USDC (threshold: $100)`);
    }
  } catch (e) {
    result.treasuryBalance = { address: treasuryAccount.address, error: e.message };
  }

  // 3. Last settlement timestamp + count in last hour
  try {
    if (supabase) {
      const { data: lastRow } = await supabase
        .from('xf_settlements')
        .select('settled_at')
        .is('deleted_at', null)
        .order('settled_at', { ascending: false })
        .limit(1)
        .single();
      result.lastSettlement = lastRow?.settled_at || null;

      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
      const { count } = await supabase
        .from('xf_settlements')
        .select('*', { count: 'exact', head: true })
        .is('deleted_at', null)
        .gte('settled_at', oneHourAgo);
      result.settlementsLastHour = count || 0;
    }
  } catch {
    // leave defaults
  }

  res.json(result);
});

module.exports = router;
