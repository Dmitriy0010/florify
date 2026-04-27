-- Migration V0009: Allow NULL performer_id in stock_transactions
-- This is necessary for automated system operations like Invoice receiving via Kafka
-- where there is no active human user in the security context.

ALTER TABLE stock_transactions ALTER COLUMN performer_id DROP NOT NULL;
