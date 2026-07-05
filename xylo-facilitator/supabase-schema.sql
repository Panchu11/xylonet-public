-- XyloFacilitator Database Schema
-- Run this in Supabase SQL Editor

-- ==========================================
-- 1. DEVELOPERS TABLE
-- Developers who register to use XyloFacilitator
-- ==========================================
CREATE TABLE IF NOT EXISTS xf_developers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  company TEXT,
  api_key TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  wallet_address TEXT,
  circle_wallet_id TEXT,
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'starter', 'pro', 'enterprise')),
  rate_limit_rpm INTEGER DEFAULT 60,
  monthly_volume_limit_usd NUMERIC DEFAULT 1000,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 2. API ROUTES TABLE
-- Developer-configured API endpoints with pricing
-- ==========================================
CREATE TABLE IF NOT EXISTS xf_api_routes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  developer_id UUID NOT NULL REFERENCES xf_developers(id) ON DELETE CASCADE,
  route_path TEXT NOT NULL,
  target_url TEXT NOT NULL,
  method TEXT DEFAULT 'GET' CHECK (method IN ('GET', 'POST', 'PUT', 'DELETE', 'PATCH')),
  price_usd NUMERIC NOT NULL DEFAULT 0.01,
  price_unit TEXT DEFAULT 'per_call' CHECK (price_unit IN ('per_call', 'per_kb', 'per_request')),
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  total_calls BIGINT DEFAULT 0,
  total_revenue_usd NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(developer_id, route_path, method)
);

-- ==========================================
-- 3. PAYMENT SETTLEMENTS TABLE
-- All x402 payment settlements processed
-- ==========================================
CREATE TABLE IF NOT EXISTS xf_settlements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tx_hash TEXT UNIQUE,
  from_address TEXT NOT NULL,
  to_address TEXT NOT NULL,
  amount_usd NUMERIC NOT NULL,
  fee_usd NUMERIC NOT NULL,
  developer_id UUID REFERENCES xf_developers(id),
  route_id UUID REFERENCES xf_api_routes(id),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'failed', 'disputed')),
  block_number BIGINT,
  eip3009_nonce TEXT,
  settled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 4. AGENTESCROW CONTRACTS TABLE
-- Off-chain record of escrow contracts
-- ==========================================
CREATE TABLE IF NOT EXISTS xf_escrow_contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id BIGINT UNIQUE,
  buyer_address TEXT NOT NULL,
  seller_address TEXT NOT NULL,
  buyer_wallet_id TEXT,
  seller_wallet_id TEXT,
  amount_usd NUMERIC NOT NULL,
  bond_amount_usd NUMERIC NOT NULL,
  description TEXT NOT NULL,
  deadline TIMESTAMPTZ,
  deliverable_hash TEXT,
  state TEXT DEFAULT 'open' CHECK (state IN ('open', 'negotiated', 'in_progress', 'submitted', 'verified', 'disputed', 'settled', 'expired', 'cancelled')),
  buyer_staked BOOLEAN DEFAULT false,
  seller_staked BOOLEAN DEFAULT false,
  negotiation_log JSONB DEFAULT '[]',
  tx_hash TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 5. ESCROW NEGOTIATIONS TABLE
-- AI agent negotiation messages
-- ==========================================
CREATE TABLE IF NOT EXISTS xf_negotiations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  escrow_id UUID NOT NULL REFERENCES xf_escrow_contracts(id) ON DELETE CASCADE,
  agent_role TEXT NOT NULL CHECK (agent_role IN ('buyer', 'seller', 'facilitator')),
  message_type TEXT NOT NULL CHECK (message_type IN ('proposal', 'counter', 'accept', 'reject', 'deliver', 'verify', 'dispute')),
  content TEXT NOT NULL,
  proposed_amount_usd NUMERIC,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 6. ANALYTICS TABLE
-- Hourly aggregated analytics
-- ==========================================
CREATE TABLE IF NOT EXISTS xf_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  period_start TIMESTAMPTZ NOT NULL,
  period_type TEXT DEFAULT 'hourly' CHECK (period_type IN ('hourly', 'daily', 'weekly', 'monthly')),
  total_transactions BIGINT DEFAULT 0,
  total_volume_usd NUMERIC DEFAULT 0,
  total_fees_usd NUMERIC DEFAULT 0,
  unique_developers INTEGER DEFAULT 0,
  unique_buyers INTEGER DEFAULT 0,
  avg_settlement_time_ms INTEGER DEFAULT 0,
  failure_rate NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(period_start, period_type)
);

-- ==========================================
-- 7. WEBHOOK EVENTS TABLE
-- Event log for developer webhooks
-- ==========================================
CREATE TABLE IF NOT EXISTS xf_webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  developer_id UUID NOT NULL REFERENCES xf_developers(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}',
  delivery_url TEXT NOT NULL,
  delivery_status TEXT DEFAULT 'pending' CHECK (delivery_status IN ('pending', 'sent', 'failed', 'retrying')),
  attempts INTEGER DEFAULT 0,
  last_attempt_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 8. WEBHOOKS TABLE
-- Developer-configured webhook endpoints for event delivery
-- ==========================================
CREATE TABLE IF NOT EXISTS xf_webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  developer_id UUID NOT NULL REFERENCES xf_developers(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  secret TEXT NOT NULL,
  events TEXT[] NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==========================================
-- INDEXES
-- ==========================================
CREATE INDEX IF NOT EXISTS idx_xf_developers_api_key ON xf_developers(api_key);
CREATE INDEX IF NOT EXISTS idx_xf_developers_email ON xf_developers(email);
CREATE INDEX IF NOT EXISTS idx_xf_api_routes_developer ON xf_api_routes(developer_id);
CREATE INDEX IF NOT EXISTS idx_xf_api_routes_path ON xf_api_routes(route_path, method);
CREATE INDEX IF NOT EXISTS idx_xf_settlements_developer ON xf_settlements(developer_id);
CREATE INDEX IF NOT EXISTS idx_xf_settlements_status ON xf_settlements(status);
CREATE INDEX IF NOT EXISTS idx_xf_settlements_from ON xf_settlements(from_address);
CREATE INDEX IF NOT EXISTS idx_xf_settlements_created ON xf_settlements(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_xf_escrow_contracts_state ON xf_escrow_contracts(state);
CREATE INDEX IF NOT EXISTS idx_xf_escrow_contracts_buyer ON xf_escrow_contracts(buyer_address);
CREATE INDEX IF NOT EXISTS idx_xf_negotiations_escrow ON xf_negotiations(escrow_id);
CREATE INDEX IF NOT EXISTS idx_xf_analytics_period ON xf_analytics(period_start DESC);
CREATE INDEX IF NOT EXISTS idx_xf_webhook_events_developer ON xf_webhook_events(developer_id);
CREATE INDEX IF NOT EXISTS idx_xf_webhooks_developer ON xf_webhooks(developer_id);

-- ==========================================
-- ROW LEVEL SECURITY
-- ==========================================
ALTER TABLE xf_developers ENABLE ROW LEVEL SECURITY;
ALTER TABLE xf_api_routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE xf_settlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE xf_escrow_contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE xf_negotiations ENABLE ROW LEVEL SECURITY;
ALTER TABLE xf_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE xf_webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE xf_webhooks ENABLE ROW LEVEL SECURITY;

-- Service role can do everything (backend uses service key)
CREATE POLICY "Service role full access" ON xf_developers FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access" ON xf_api_routes FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access" ON xf_settlements FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access" ON xf_escrow_contracts FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access" ON xf_negotiations FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access" ON xf_analytics FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access" ON xf_webhook_events FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access on xf_webhooks" ON xf_webhooks FOR ALL USING (true) WITH CHECK (true);

-- ==========================================
-- VIEWS
-- ==========================================
CREATE OR REPLACE VIEW xf_developer_dashboard AS
SELECT
  d.id AS developer_id,
  d.email,
  d.name,
  d.plan,
  d.wallet_address,
  COUNT(DISTINCT r.id) AS total_routes,
  COUNT(DISTINCT s.id) AS total_settlements,
  COALESCE(SUM(s.amount_usd), 0) AS total_volume_usd,
  COALESCE(SUM(s.fee_usd), 0) AS total_fees_usd,
  COUNT(DISTINCT s.from_address) AS unique_payers,
  MAX(s.created_at) AS last_payment_at
FROM xf_developers d
LEFT JOIN xf_api_routes r ON r.developer_id = d.id
LEFT JOIN xf_settlements s ON s.developer_id = d.id
GROUP BY d.id, d.email, d.name, d.plan, d.wallet_address;
