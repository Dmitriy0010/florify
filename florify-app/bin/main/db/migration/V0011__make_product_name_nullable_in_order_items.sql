-- ============================================================
-- MIGRATION 11: Make product_name nullable in order_items
-- ============================================================

ALTER TABLE order_items ALTER COLUMN product_name DROP NOT NULL;
