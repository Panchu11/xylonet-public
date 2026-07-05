const express = require('express');
const router = express.Router();

/**
 * GET /v1/analytics/overview
 * Get platform-wide analytics
 */
router.get('/overview', async (req, res) => {
  try {
    const supabase = req.app.locals.supabase;

    // Get counts and aggregates efficiently
    const [developers, routes, settlements] = await Promise.all([
      supabase.from('xf_developers').select('id', { count: 'exact', head: true }),
      supabase.from('xf_api_routes').select('id', { count: 'exact', head: true }),
      supabase.from('xf_settlements').select('id', { count: 'exact', head: true })
    ]);

    // Use RPC for volume aggregation instead of fetching all rows
    const { data: volumeData } = await supabase.rpc('xf_get_settlement_totals').single();
    const totalVolume = volumeData?.total_volume || 0;
    const totalFees = volumeData?.total_fees || 0;

    res.json({
      platform: {
        totalDevelopers: developers.count || 0,
        totalRoutes: routes.count || 0,
        totalSettlements: settlements.count || 0,
        totalVolumeUSD: Number(totalVolume).toFixed(2),
        totalFeesUSD: Number(totalFees).toFixed(2)
      },
      network: {
        name: 'Arc Testnet',
        chainId: 5042002,
        avgBlockTime: '<1s'
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /v1/analytics/recent
 * Get recent settlements
 */
router.get('/recent', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const supabase = req.app.locals.supabase;

    const { data, error } = await supabase
      .from('xf_settlements')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) return res.status(500).json({ error: error.message });

    res.json({ settlements: data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
