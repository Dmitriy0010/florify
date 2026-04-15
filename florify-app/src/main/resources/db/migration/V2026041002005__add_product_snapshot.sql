-- Create product_snapshots table directly (replacing the previous RENAME/ALTER logic)
CREATE TABLE product_snapshots (
    product_id              UUID PRIMARY KEY,
    name                    VARCHAR(255) NOT NULL,
    sku                     VARCHAR(50) NOT NULL,
    unit                    VARCHAR(20) NOT NULL,
    default_shelf_life_days INTEGER NOT NULL DEFAULT 7,
    active                  BOOLEAN NOT NULL DEFAULT TRUE,
    last_synced_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_product_snapshots_sku ON product_snapshots(sku);

-- Add comment explaining this is a localized cache from Catalog service
COMMENT ON TABLE product_snapshots IS 'Localized cache of product data from product-catalog-service used by inventory-service';
