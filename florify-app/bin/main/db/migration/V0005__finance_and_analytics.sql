-- ============================================================
-- MIGRATION 5: Finance, Analytics
-- ============================================================

-- ============================================================
-- FINANCE
-- ============================================================

CREATE TABLE financial_transactions (
    id           UUID PRIMARY KEY,
    type         VARCHAR(30) NOT NULL,
    amount       DECIMAL(19,2) NOT NULL,
    reference_id UUID NOT NULL,
    description  TEXT,
    performed_by UUID,
    occurred_at  TIMESTAMPTZ NOT NULL
);
CREATE INDEX idx_finance_occurred_at ON financial_transactions(occurred_at);
CREATE INDEX idx_finance_type ON financial_transactions(type);
CREATE INDEX idx_finance_ref_type ON financial_transactions(reference_id, type);

-- ============================================================
-- ANALYTICS
-- ============================================================

CREATE TABLE analytics_order_facts (
    id                   UUID PRIMARY KEY,
    order_id             UUID NOT NULL,
    customer_id          UUID,
    store_id             UUID NOT NULL REFERENCES stores(id),
    status               VARCHAR(20) NOT NULL,
    total_amount         NUMERIC(19,2) NOT NULL DEFAULT 0,
    cogs_amount          NUMERIC(19,2) NOT NULL DEFAULT 0,
    gross_profit         NUMERIC(19,2) NOT NULL DEFAULT 0,
    assigned_employee_id UUID,
    order_source         VARCHAR(20),
    item_count           INTEGER DEFAULT 0,
    completed_at         TIMESTAMPTZ,
    cancelled_at         TIMESTAMPTZ,
    cancellation_reason  TEXT,
    recorded_at          TIMESTAMPTZ NOT NULL
);
CREATE UNIQUE INDEX idx_aof_order_id ON analytics_order_facts(order_id);
CREATE INDEX idx_aof_completed_at ON analytics_order_facts(completed_at DESC);
CREATE INDEX idx_aof_customer_id ON analytics_order_facts(customer_id);
CREATE INDEX idx_analytics_order_facts_store_dates ON analytics_order_facts(store_id, completed_at);

CREATE TABLE analytics_cost_facts (
    id             UUID PRIMARY KEY,
    cost_type      VARCHAR(20) NOT NULL,
    source_ref_id  UUID NOT NULL,
    store_id       UUID NOT NULL,
    occurred_at    TIMESTAMPTZ NOT NULL,
    recorded_at    TIMESTAMPTZ NOT NULL,
    amount         NUMERIC(19,2),
    quantity       NUMERIC(19,2),
    reason         VARCHAR(50),
    supplier_id    UUID,
    supplier_name  VARCHAR(255),
    item_count     INTEGER,
    employee_id    UUID,
    employee_name  VARCHAR(255),
    employee_role  VARCHAR(100),
    period_start   DATE,
    period_end     DATE,
    product_id     UUID,
    product_name   VARCHAR(255),
    category_id    UUID,
    category_name  VARCHAR(255),
    CONSTRAINT chk_analytics_cost_type CHECK (cost_type IN ('PURCHASE','SALARY','WRITEOFF'))
);
CREATE UNIQUE INDEX uq_acf_type_source_ref ON analytics_cost_facts(cost_type, source_ref_id);
CREATE INDEX idx_acf_type_occurred_at ON analytics_cost_facts(cost_type, occurred_at DESC);
CREATE INDEX idx_acf_store_type_occurred_at ON analytics_cost_facts(store_id, cost_type, occurred_at DESC);
