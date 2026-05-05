-- ============================================================
-- MIGRATION 1: Extensions, Catalog, Auth, Stores
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- CATALOG
-- ============================================================

CREATE TABLE product_categories (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name        VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    active      BOOLEAN NOT NULL DEFAULT true,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
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
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_synced_at          TIMESTAMPTZ
);

CREATE UNIQUE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_category ON products(category_id);

-- Seed categories
INSERT INTO product_categories (id, name, description, created_at, updated_at) VALUES
    (uuid_generate_v4(), 'Розы',               'Срезанные розы всех сортов',      NOW(), NOW()),
    (uuid_generate_v4(), 'Тюльпаны',           'Срезанные тюльпаны',              NOW(), NOW()),
    (uuid_generate_v4(), 'Хризантемы',         'Срезанные хризантемы',            NOW(), NOW()),
    (uuid_generate_v4(), 'Лилии',              'Срезанные лилии',                 NOW(), NOW()),
    (uuid_generate_v4(), 'Букеты',             'Готовые букеты и композиции',     NOW(), NOW()),
    (uuid_generate_v4(), 'Горшечные растения', 'Комнатные растения в горшках',    NOW(), NOW()),
    (uuid_generate_v4(), 'Аксессуары',         'Упаковка, ленты, вазы',           NOW(), NOW());

-- ============================================================
-- AUTH
-- ============================================================

CREATE TABLE users (
    id            UUID PRIMARY KEY,
    email         VARCHAR(255) UNIQUE NOT NULL,
    phone         VARCHAR(20) UNIQUE,
    first_name    VARCHAR(100),
    last_name     VARCHAR(100),
    password_hash VARCHAR(255) NOT NULL,
    active        BOOLEAN NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE user_roles (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role    VARCHAR(50) NOT NULL,
    PRIMARY KEY (user_id, role)
);

CREATE TABLE refresh_tokens (
    id          UUID PRIMARY KEY,
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash  VARCHAR(255) NOT NULL UNIQUE,
    expires_at  TIMESTAMPTZ NOT NULL,
    revoked     BOOLEAN NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_refresh_tokens_user ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_expires ON refresh_tokens(expires_at);

-- ============================================================
-- STORES
-- ============================================================

CREATE TABLE stores (
    id      UUID PRIMARY KEY,
    name    VARCHAR(100) NOT NULL,
    address VARCHAR(255) NOT NULL,
    phone   VARCHAR(20),
    active  BOOLEAN NOT NULL DEFAULT TRUE
);

-- Seed Main Store
INSERT INTO stores (id, name, address, phone, active)
VALUES ('00000000-0000-0000-0000-000000000001', 'Главный филиал (Центральный)', 'ул. Цветочная, д. 1', '+7 (900) 123-45-67', TRUE);
