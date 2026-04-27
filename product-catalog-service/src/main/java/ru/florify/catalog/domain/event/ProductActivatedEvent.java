package ru.florify.catalog.domain.event;

import ru.florify.catalog.domain.model.Product;
import java.time.Instant;
import java.util.UUID;

public record ProductActivatedEvent(
    UUID id,
    String name,
    Instant timestamp
) {
    public static ProductActivatedEvent from(Product product, Instant now) {
        return new ProductActivatedEvent(product.getId(), product.getName(), now);
    }
}
