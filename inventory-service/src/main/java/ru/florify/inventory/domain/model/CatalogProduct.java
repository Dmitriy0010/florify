package ru.florify.inventory.domain.model;

import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;

import java.util.UUID;

/**
 * Read-only view of a row in {@code products} (shared catalog table).
 */
@Getter
@Builder
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class CatalogProduct {

    @EqualsAndHashCode.Include
    private final UUID productId;
    private final String name;
    private final String sku;
    private final String unit;
    private final int defaultShelfLifeDays;
    private final boolean active;
    private final String imageUrl;
}
