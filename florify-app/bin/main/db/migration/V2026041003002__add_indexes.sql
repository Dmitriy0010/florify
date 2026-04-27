ALTER TABLE orders ADD COLUMN idempotency_key VARCHAR(64);

CREATE UNIQUE INDEX uq_order_idempotency_key 
ON orders(idempotency_key)
WHERE idempotency_key IS NOT NULL;
