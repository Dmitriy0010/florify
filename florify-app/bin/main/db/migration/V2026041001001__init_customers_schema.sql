CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Клиенты
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
    version         INTEGER NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ NOT NULL,
    updated_at      TIMESTAMPTZ NOT NULL
);

-- Partial Unique Index: исключает деактивированных клиентов
CREATE UNIQUE INDEX idx_customers_phone ON customers(phone) WHERE active = true;

CREATE INDEX idx_customers_user_id ON customers(user_id);
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_tags ON customers USING gin(tags);
-- Поиск по месяцу и дню рождения — игнорирует год
CREATE INDEX idx_customers_birth_month_day
    ON customers(EXTRACT(MONTH FROM birth_date), EXTRACT(DAY FROM birth_date))
    WHERE birth_date IS NOT NULL;

-- Счета лояльности
CREATE TABLE loyalty_accounts (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id     UUID NOT NULL REFERENCES customers(id),
    tier            VARCHAR(20) NOT NULL DEFAULT 'BRONZE',
    points_balance  INTEGER NOT NULL DEFAULT 0 CHECK (points_balance >= 0),
    reserved_points INTEGER NOT NULL DEFAULT 0 CHECK (reserved_points >= 0),
    total_spent     NUMERIC(19,2) NOT NULL DEFAULT 0,
    version         INTEGER NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ NOT NULL,
    updated_at      TIMESTAMPTZ NOT NULL
);

CREATE UNIQUE INDEX idx_loyalty_accounts_customer ON loyalty_accounts(customer_id);

-- Транзакции по баллам — append-only, БЕЗ version
CREATE TABLE loyalty_transactions (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    loyalty_account_id  UUID NOT NULL REFERENCES loyalty_accounts(id),
    order_id            UUID,
    type                VARCHAR(20) NOT NULL, -- EARN, RESERVE, CONFIRM, RELEASE
    points              INTEGER NOT NULL,
    description         VARCHAR(500),
    occurred_at         TIMESTAMPTZ NOT NULL
);

CREATE INDEX idx_loyalty_tx_account   ON loyalty_transactions(loyalty_account_id);
CREATE INDEX idx_loyalty_tx_order     ON loyalty_transactions(order_id) WHERE order_id IS NOT NULL;
CREATE INDEX idx_loyalty_tx_occurred  ON loyalty_transactions(occurred_at);

-- CRM-лента — append-only, БЕЗ version
CREATE TABLE customer_events (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id     UUID NOT NULL REFERENCES customers(id),
    performer_id    UUID NOT NULL,
    type            VARCHAR(30) NOT NULL,
    content         TEXT NOT NULL,
    occurred_at     TIMESTAMPTZ NOT NULL
);

CREATE INDEX idx_customer_events_customer ON customer_events(customer_id);

-- Конфигурация тиров лояльности — изменяемая, с version
CREATE TABLE loyalty_tier_configs (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tier                VARCHAR(20) NOT NULL UNIQUE,
    tier_rank           INTEGER NOT NULL UNIQUE,     -- для сравнения без ordinal()
    min_spend           NUMERIC(19,2) NOT NULL DEFAULT 0,
    points_per_hundred  INTEGER NOT NULL DEFAULT 1,
    discount_percent    NUMERIC(5,2) NOT NULL DEFAULT 0,
    version             INTEGER NOT NULL DEFAULT 0
);

INSERT INTO loyalty_tier_configs (id, tier, tier_rank, min_spend, points_per_hundred, discount_percent)
VALUES
    (uuid_generate_v4(), 'BRONZE',   1, 0,       1, 0),
    (uuid_generate_v4(), 'SILVER',   2, 10000,   2, 3),
    (uuid_generate_v4(), 'GOLD',     3, 50000,   3, 5),
    (uuid_generate_v4(), 'PLATINUM', 4, 200000,  5, 10);

-- Настройки уведомлений клиента
CREATE TABLE notification_preferences (
    customer_id             UUID PRIMARY KEY REFERENCES customers(id),
    email_enabled           BOOLEAN NOT NULL DEFAULT true,
    sms_enabled             BOOLEAN NOT NULL DEFAULT false,
    push_enabled            BOOLEAN NOT NULL DEFAULT true,
    birthday_promo_enabled  BOOLEAN NOT NULL DEFAULT true
);
