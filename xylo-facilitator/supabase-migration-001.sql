-- XyloFacilitator additional schema: analytics RPC + webhook fields
-- Run this AFTER supabase-schema.sql

-- Aggregation function for settlement totals (avoids fetching all rows)
CREATE OR REPLACE FUNCTION xf_get_settlement_totals()
RETURNS TABLE(total_volume numeric, total_fees numeric) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COALESCE(SUM(amount_usd), 0) as total_volume,
    COALESCE(SUM(fee_usd), 0) as total_fees
  FROM xf_settlements
  WHERE status = 'confirmed';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add webhook fields to developers table (if not already present)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'xf_developers' AND column_name = 'webhook_url') THEN
    ALTER TABLE xf_developers ADD COLUMN webhook_url TEXT;
    ALTER TABLE xf_developers ADD COLUMN webhook_secret TEXT;
    ALTER TABLE xf_developers ADD COLUMN webhook_events TEXT[] DEFAULT ARRAY['payment.settled'];
  END IF;
END $$;

-- Add last_error column to webhook events if not present
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'xf_webhook_events' AND column_name = 'last_error') THEN
    ALTER TABLE xf_webhook_events ADD COLUMN last_error TEXT;
  END IF;
END $$;
