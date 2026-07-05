-- XyloFacilitator Migration 002: Agent Faucet seeds table
-- Tracks testnet USDC disbursements to new agents

CREATE TABLE IF NOT EXISTS xf_agent_seeds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_address TEXT NOT NULL,
  amount_usdc NUMERIC(12, 6) NOT NULL DEFAULT 10.0,
  tx_hash TEXT NOT NULL,
  funded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ip_address TEXT
);

-- One seed per agent address
CREATE UNIQUE INDEX IF NOT EXISTS idx_agent_seeds_address ON xf_agent_seeds (agent_address);

-- Index for admin lookups
CREATE INDEX IF NOT EXISTS idx_agent_seeds_funded_at ON xf_agent_seeds (funded_at DESC);
