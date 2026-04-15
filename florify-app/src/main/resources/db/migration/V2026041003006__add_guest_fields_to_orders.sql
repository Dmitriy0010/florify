-- V6: Add guest fields to orders and drop non-null constraint from customer_id
ALTER TABLE orders ALTER COLUMN customer_id DROP NOT NULL;
ALTER TABLE orders ADD COLUMN guest_phone VARCHAR(20);
ALTER TABLE orders ADD COLUMN guest_name VARCHAR(100);
