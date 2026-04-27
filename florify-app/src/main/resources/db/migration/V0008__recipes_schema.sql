-- ============================================================
-- MIGRATION 8: Recipes (Bill of Materials)
-- ============================================================

CREATE TABLE recipes (
    id          UUID PRIMARY KEY,
    product_id  UUID NOT NULL UNIQUE, -- One recipe per product (e.g. bouquet)
    is_active   BOOLEAN NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ NOT NULL,
    updated_at  TIMESTAMPTZ NOT NULL
);

CREATE INDEX idx_recipes_product_id ON recipes(product_id);

CREATE TABLE recipe_items (
    id             UUID PRIMARY KEY,
    recipe_id      UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
    ingredient_id  UUID NOT NULL, -- Reference to another product (e.g. "Red Rose" as ingredient)
    quantity       DECIMAL(19,3) NOT NULL,
    created_at     TIMESTAMPTZ NOT NULL
);

CREATE INDEX idx_recipe_items_recipe_id ON recipe_items(recipe_id);
