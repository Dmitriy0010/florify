CREATE TABLE stock_batches (
    id                  UUID PRIMARY KEY,
    product_id          UUID NOT NULL REFERENCES products(id),
    quantity_received   DECIMAL(10, 2) NOT NULL,
    quantity_remaining  DECIMAL(10, 2) NOT NULL,
    unit_cost           DECIMAL(10, 2) NOT NULL,
    received_at         TIMESTAMPTZ NOT NULL,
    expires_at          TIMESTAMPTZ,
    status              VARCHAR(20) NOT NULL,
    source_document_id  VARCHAR(100) NOT NULL,
    version             INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX idx_batches_product_received 
ON stock_batches(product_id, received_at);

CREATE INDEX idx_batches_status 
ON stock_batches(status)
WHERE status = 'AVAILABLE';
