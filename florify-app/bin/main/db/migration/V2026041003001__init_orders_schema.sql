CREATE TABLE orders (
    id                UUID PRIMARY KEY,
    order_number      VARCHAR(20) UNIQUE NOT NULL,
    customer_id       UUID NOT NULL,
    status            VARCHAR(30) NOT NULL,
    total_amount      DECIMAL(10, 2) NOT NULL,
    discount_amount   DECIMAL(10, 2) NOT NULL DEFAULT 0,
    bonus_points_used DECIMAL(10, 2) NOT NULL DEFAULT 0,
    final_amount      DECIMAL(10, 2) NOT NULL,
    type              VARCHAR(20) NOT NULL,
    source            VARCHAR(20) NOT NULL,
    payment_method    VARCHAR(20) NOT NULL,
    is_paid           BOOLEAN NOT NULL DEFAULT FALSE,
    created_at        TIMESTAMPTZ NOT NULL,
    updated_at        TIMESTAMPTZ NOT NULL,
    version           INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE order_items (
    id            UUID PRIMARY KEY,
    order_id      UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id    UUID NOT NULL,
    product_name  VARCHAR(200) NOT NULL,
    quantity      DECIMAL(10, 2) NOT NULL,
    unit_price    DECIMAL(10, 2) NOT NULL,
    line_total    DECIMAL(10, 2) NOT NULL
);

CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_order_items_order ON order_items(order_id);

CREATE SEQUENCE order_number_seq START WITH 1000;
