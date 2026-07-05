-- XyloFacilitator Migration 003: Webhook configurations table
-- Supports the /v1/developer/webhooks endpoints in developer.js
-- Run this AFTER supabase-schema.sql

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

-- Index for lookups by developer
CREATE INDEX IF NOT EXISTS idx_xf_webhooks_developer ON xf_webhooks(developer_id);

-- Enable Row Level Security
ALTER TABLE xf_webhooks ENABLE ROW LEVEL SECURITY;

-- Service role has full access (backend uses service key)
CREATE POLICY "Service role full access on xf_webhooks" ON xf_webhooks
  FOR ALL USING (true) WITH CHECK (true);
