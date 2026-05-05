-- V0011: Add supplier_id to stock_batches for batch tracking history
ALTER TABLE stock_batches ADD COLUMN IF NOT EXISTS supplier_id UUID;
