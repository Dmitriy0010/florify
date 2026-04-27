package ru.florify.catalog.domain.model;

import lombok.*;
import ru.florify.common.domain.enums.UnitOfMeasure;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Getter
@Builder
@With
@AllArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class Product {

    @EqualsAndHashCode.Include
    private final UUID id;

    private final String sku;               // Unique ID, generated automatically or manually
    private final String name;
    private final String description;
    private final UUID categoryId;
    private final UnitOfMeasure unit;
    private final BigDecimal currentPrice;
    private final String imageUrl;          // nullable; link to media-service
    private final int defaultShelfLifeDays; // for inventory management
    private final boolean active;
    private final Instant createdAt;
    private final Instant updatedAt;

    public Product updatePrice(BigDecimal newPrice, Instant now) {
        if (newPrice.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Price must be positive");
        }
        return this.withCurrentPrice(newPrice).withUpdatedAt(now);
    }

    public Product deactivate(Instant now) {
        return this.withActive(false).withUpdatedAt(now);
    }

    public Product activate(Instant now) {
        return this.withActive(true).withUpdatedAt(now);
    }

    public Product update(String name, String description, UUID categoryId,
                          String imageUrl, int defaultShelfLifeDays, Instant now) {
        return this.withName(name)
                .withDescription(description)
                .withCategoryId(categoryId)
                .withImageUrl(imageUrl)
                .withDefaultShelfLifeDays(defaultShelfLifeDays)
                .withUpdatedAt(now);
    }
}
