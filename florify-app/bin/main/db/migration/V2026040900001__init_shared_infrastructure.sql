-- Shared Infrastructure for Shedlock and Outbox

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Unified Outbox Table
CREATE TABLE outbox_events (
    id             UUID PRIMARY KEY,
    type           VARCHAR(255) NOT NULL,
    aggregate_id   VARCHAR(255) NOT NULL,
    payload        JSONB NOT NULL,
    metadata       JSONB,
    status         VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    sent_at        TIMESTAMPTZ,
    error_message  TEXT
);

CREATE INDEX idx_outbox_events_status_created ON outbox_events (status, created_at) WHERE status = 'PENDING';

-- Shared Shedlock Table
CREATE TABLE shedlock (
    name       VARCHAR(64) PRIMARY KEY,
    lock_until TIMESTAMPTZ NOT NULL,
    locked_at  TIMESTAMPTZ NOT NULL,
    locked_by  VARCHAR(255) NOT NULL
);

CREATE TABLE product_categories (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name        VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    active      BOOLEAN NOT NULL DEFAULT true,
    version     INTEGER NOT NULL DEFAULT 0,
    created_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE products (
    id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sku                     VARCHAR(50) NOT NULL UNIQUE,
    name                    VARCHAR(200) NOT NULL,
    description             TEXT,
    category_id             UUID REFERENCES product_categories(id),
    unit                    VARCHAR(20) NOT NULL,
    current_price           NUMERIC(19,2) NOT NULL DEFAULT 0,
    image_url               VARCHAR(500),
    default_shelf_life_days INTEGER NOT NULL DEFAULT 7,
    active                  BOOLEAN NOT NULL DEFAULT true,
    version                 INTEGER NOT NULL DEFAULT 0,
    created_at              TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    last_synced_at          TIMESTAMP WITH TIME ZONE
);

CREATE UNIQUE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_category ON products(category_id);

CREATE TABLE processed_messages (
    event_id      UUID NOT NULL,
    consumer_name VARCHAR(100) NOT NULL,
    processed_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    PRIMARY KEY (event_id, consumer_name)
);

CREATE INDEX idx_processed_messages_at ON processed_messages(processed_at);

COMMENT ON TABLE processed_messages IS 'Tracks processed Kafka event IDs per consumer to ensure idempotent processing.';
