package ru.florify.inventory.domain.model;

import lombok.*;
import java.time.Instant;
import java.util.UUID;

/**
 * Domain record for ProductSnapshot in inventory-service.
 * Represents a local, consistent "view" of product data from product-catalog-service.
 */
@Getter
@Builder
@With
@AllArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class ProductSnapshot {

    @EqualsAndHashCode.Include
    private final UUID productId;    // = product.id from catalog

    private final String name;
    private final String sku;
    private final String unit;
    private final int defaultShelfLifeDays;
    private final boolean active;
    private final Instant lastSyncedAt;
}
