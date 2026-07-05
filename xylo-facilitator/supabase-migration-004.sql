-- Migration 004: Add soft delete support to settlements
ALTER TABLE xf_settlements ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;
CREATE INDEX IF NOT EXISTS idx_xf_settlements_active ON xf_settlements(deleted_at) WHERE deleted_at IS NULL;
