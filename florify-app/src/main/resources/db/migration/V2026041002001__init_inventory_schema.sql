-- Балансировка стока
CREATE TABLE stock_balances (
    id                UUID PRIMARY KEY,
    product_id        UUID NOT NULL UNIQUE REFERENCES products(id) ON DELETE RESTRICT,
    quantity_in_stock NUMERIC(12,3) NOT NULL DEFAULT 0,
    average_cost      NUMERIC(10,2) NOT NULL DEFAULT 0,
    version           INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX idx_stock_balances_product_id ON stock_balances(product_id);

CREATE TABLE stock_transactions (
    id                 UUID PRIMARY KEY,
    product_id         UUID NOT NULL REFERENCES products(id),
    type               VARCHAR(30) NOT NULL,
    quantity           NUMERIC(12,3) NOT NULL,
    cost_basis         NUMERIC(10,2) NOT NULL,
    total_value        NUMERIC(14,2) NOT NULL,
    write_off_reason   VARCHAR(30),
    comment            TEXT,
    source_document_id VARCHAR(255) NOT NULL UNIQUE,
    performer_id       UUID NOT NULL,
    created_at         TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_st_product_id ON stock_transactions(product_id);
