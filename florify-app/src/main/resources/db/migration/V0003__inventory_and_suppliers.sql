-- ============================================================
-- MIGRATION 3: Inventory (stock balances, batches, transactions)
--               Suppliers & Purchase Invoices
-- ============================================================

-- ============================================================
-- INVENTORY
-- ============================================================

CREATE TABLE stock_balances (
    id                UUID PRIMARY KEY,
    product_id        UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    store_id          UUID NOT NULL REFERENCES stores(id),
    quantity_in_stock NUMERIC(12,3) NOT NULL DEFAULT 0,
    average_cost      NUMERIC(10,2) NOT NULL DEFAULT 0,
    CONSTRAINT stock_balances_product_store_unique UNIQUE (product_id, store_id)
);
CREATE INDEX idx_stock_balances_product_id ON stock_balances(product_id);
CREATE INDEX idx_stock_balances_store_id ON stock_balances(store_id);

CREATE TABLE stock_batches (
    id                 UUID PRIMARY KEY,
    product_id         UUID NOT NULL REFERENCES products(id),
    store_id           UUID NOT NULL REFERENCES stores(id),
    quantity_received  DECIMAL(10,2) NOT NULL,
    quantity_remaining DECIMAL(10,2) NOT NULL,
    unit_cost          DECIMAL(10,2) NOT NULL,
    received_at        TIMESTAMPTZ NOT NULL,
    expires_at         TIMESTAMPTZ,
    status             VARCHAR(20) NOT NULL,
    source_document_id VARCHAR(100) NOT NULL
);
CREATE INDEX idx_batches_product_received ON stock_batches(product_id, received_at);
CREATE INDEX idx_batches_status ON stock_batches(status) WHERE status = 'AVAILABLE';
CREATE INDEX idx_batches_store ON stock_batches(store_id);

CREATE TABLE stock_transactions (
    id                 UUID PRIMARY KEY,
    product_id         UUID NOT NULL REFERENCES products(id),
    store_id           UUID NOT NULL REFERENCES stores(id),
    type               VARCHAR(30) NOT NULL,
    quantity           NUMERIC(12,3) NOT NULL,
    cost_basis         NUMERIC(10,2) NOT NULL,
    total_value        NUMERIC(14,2) NOT NULL,
    write_off_reason   VARCHAR(30),
    comment            TEXT,
    source_document_id VARCHAR(255) NOT NULL UNIQUE,
    performer_id       UUID NOT NULL,
    created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_st_product_id ON stock_transactions(product_id);
CREATE INDEX idx_st_store_product ON stock_transactions(store_id, product_id);

-- ============================================================
-- SUPPLIERS & PURCHASE INVOICES
-- ============================================================

CREATE TABLE suppliers (
    id             UUID PRIMARY KEY,
    name           VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255),
    phone          VARCHAR(50),
    email          VARCHAR(255),
    address        TEXT,
    tax_id         VARCHAR(50) UNIQUE,
    payment_terms  VARCHAR(50) NOT NULL,
    rating         INTEGER CHECK (rating BETWEEN 1 AND 5),
    notes          TEXT,
    active         BOOLEAN NOT NULL DEFAULT TRUE,
    created_at     TIMESTAMPTZ NOT NULL
);
CREATE INDEX idx_suppliers_name ON suppliers(name);
CREATE INDEX idx_suppliers_active ON suppliers(active);

CREATE TABLE purchase_invoices (
    id                  UUID PRIMARY KEY,
    invoice_number      VARCHAR(100) NOT NULL,
    supplier_id         UUID NOT NULL REFERENCES suppliers(id),
    supplier_name       VARCHAR(255) NOT NULL,
    store_id            UUID NOT NULL REFERENCES stores(id),
    status              VARCHAR(50) NOT NULL,
    total_amount        NUMERIC(19,2) NOT NULL,
    planned_delivery_at TIMESTAMPTZ,
    received_at         TIMESTAMPTZ,
    comment             TEXT,
    created_by          UUID NOT NULL,
    created_at          TIMESTAMPTZ NOT NULL
);
CREATE UNIQUE INDEX idx_purchase_invoices_supplier_number ON purchase_invoices(supplier_id, invoice_number);
CREATE INDEX idx_purchase_invoices_status ON purchase_invoices(status);
CREATE INDEX idx_purchase_invoices_created_at ON purchase_invoices(created_at DESC);
CREATE INDEX idx_pi_store ON purchase_invoices(store_id);

CREATE TABLE purchase_invoice_items (
    id                UUID PRIMARY KEY,
    invoice_id        UUID NOT NULL REFERENCES purchase_invoices(id) ON DELETE CASCADE,
    product_id        UUID NOT NULL,
    product_name      VARCHAR(255) NOT NULL,
    ordered_quantity  NUMERIC(19,3) NOT NULL,
    received_quantity NUMERIC(19,3) NOT NULL DEFAULT 0,
    unit_price        NUMERIC(19,2) NOT NULL,
    expires_at        DATE
);
CREATE INDEX idx_purchase_invoice_items_invoice_id ON purchase_invoice_items(invoice_id);
