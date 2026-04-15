CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE price_history (
    id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id     UUID NOT NULL REFERENCES products(id),
    old_price      NUMERIC(19,2) NOT NULL,
    new_price      NUMERIC(19,2) NOT NULL,
    performer_id   UUID NOT NULL,
    reason         VARCHAR(500),
    occurred_at    TIMESTAMPTZ NOT NULL
);

CREATE INDEX idx_price_history_product ON price_history(product_id);
CREATE INDEX idx_price_history_occurred ON price_history(occurred_at);

-- Initial categories
INSERT INTO product_categories (id, name, description, created_at, updated_at) VALUES
    (uuid_generate_v4(), 'Розы', 'Срезанные розы всех сортов', NOW(), NOW()),
    (uuid_generate_v4(), 'Тюльпаны', 'Срезанные тюльпаны', NOW(), NOW()),
    (uuid_generate_v4(), 'Хризантемы', 'Срезанные хризантемы', NOW(), NOW()),
    (uuid_generate_v4(), 'Лилии', 'Срезанные лилии', NOW(), NOW()),
    (uuid_generate_v4(), 'Букеты', 'Готовые букеты и композиции', NOW(), NOW()),
    (uuid_generate_v4(), 'Горшечные растения', 'Комнатные растения в горшках', NOW(), NOW()),
    (uuid_generate_v4(), 'Аксессуары', 'Упаковка, ленты, вазы', NOW(), NOW());
