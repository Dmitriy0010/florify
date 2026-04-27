-- ============================================================
-- MIGRATION 2: Customers, Loyalty, Orders
-- ============================================================

-- ============================================================
-- CUSTOMERS & LOYALTY
-- ============================================================

CREATE TABLE customers (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phone           VARCHAR(20),
    email           VARCHAR(255),
    first_name      VARCHAR(100) NOT NULL,
    last_name       VARCHAR(100),
    birth_date      DATE,
    gender          VARCHAR(20) NOT NULL DEFAULT 'UNSPECIFIED',
    source          VARCHAR(20) NOT NULL DEFAULT 'WEB',
    tags            TEXT[] NOT NULL DEFAULT '{}',
    user_id         UUID,
    active          BOOLEAN NOT NULL DEFAULT true,
    created_at      TIMESTAMPTZ NOT NULL,
    updated_at      TIMESTAMPTZ NOT NULL
);

CREATE UNIQUE INDEX idx_customers_phone ON customers(phone) WHERE active = true;
CREATE INDEX idx_customers_user_id ON customers(user_id);
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_tags ON customers USING gin(tags);
CREATE INDEX idx_customers_birth_month_day
    ON customers(EXTRACT(MONTH FROM birth_date), EXTRACT(DAY FROM birth_date))
    WHERE birth_date IS NOT NULL;

CREATE TABLE loyalty_accounts (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id     UUID NOT NULL REFERENCES customers(id),
    tier            VARCHAR(20) NOT NULL DEFAULT 'BRONZE',
    points_balance  INTEGER NOT NULL DEFAULT 0 CHECK (points_balance >= 0),
    reserved_points INTEGER NOT NULL DEFAULT 0 CHECK (reserved_points >= 0),
    total_spent     NUMERIC(19,2) NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ NOT NULL,
    updated_at      TIMESTAMPTZ NOT NULL
);

CREATE UNIQUE INDEX idx_loyalty_accounts_customer ON loyalty_accounts(customer_id);

CREATE TABLE loyalty_transactions (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    loyalty_account_id  UUID NOT NULL REFERENCES loyalty_accounts(id),
    order_id            UUID,
    type                VARCHAR(20) NOT NULL,
    points              INTEGER NOT NULL,
    description         VARCHAR(500),
    occurred_at         TIMESTAMPTZ NOT NULL
);

CREATE INDEX idx_loyalty_tx_account  ON loyalty_transactions(loyalty_account_id);
CREATE INDEX idx_loyalty_tx_order    ON loyalty_transactions(order_id) WHERE order_id IS NOT NULL;
CREATE INDEX idx_loyalty_tx_occurred ON loyalty_transactions(occurred_at);

-- ============================================================
-- ORDERS
-- ============================================================

CREATE SEQUENCE order_number_seq START WITH 1000;

CREATE TABLE orders (
    id                UUID PRIMARY KEY,
    order_number      VARCHAR(20) UNIQUE NOT NULL,
    idempotency_key   VARCHAR(64),
    customer_id       UUID,
    guest_phone       VARCHAR(20),
    guest_name        VARCHAR(100),
    status            VARCHAR(30) NOT NULL,
    total_amount      DECIMAL(10,2) NOT NULL,
    discount_amount   DECIMAL(10,2) NOT NULL DEFAULT 0,
    bonus_points_used DECIMAL(10,2) NOT NULL DEFAULT 0,
    final_amount      DECIMAL(10,2) NOT NULL,
    type              VARCHAR(20) NOT NULL,
    source            VARCHAR(20) NOT NULL,
    payment_method    VARCHAR(20) NOT NULL,
    is_paid           BOOLEAN NOT NULL DEFAULT FALSE,
    florist_id        UUID,
    store_id          UUID NOT NULL REFERENCES stores(id),
    delivery_address  TEXT,
    delivery_slot_id  UUID,
    delivery_zone_id  UUID,
    created_at        TIMESTAMPTZ NOT NULL,
    updated_at        TIMESTAMPTZ NOT NULL
);

CREATE UNIQUE INDEX uq_order_idempotency_key ON orders(idempotency_key) WHERE idempotency_key IS NOT NULL;
CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_store ON orders(store_id);

CREATE TABLE order_items (
    id            UUID PRIMARY KEY,
    order_id      UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id    UUID NOT NULL,
    product_name  VARCHAR(200) NOT NULL,
    quantity      DECIMAL(10,2) NOT NULL,
    unit_price    DECIMAL(10,2) NOT NULL,
    line_total    DECIMAL(10,2) NOT NULL
);

CREATE INDEX idx_order_items_order ON order_items(order_id);
