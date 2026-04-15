package ru.florify.catalog.domain.event;

import ru.florify.catalog.domain.model.Product;
import ru.florify.common.domain.event.DomainEvent;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record ProductPriceChangedEvent(
    UUID eventId,
    UUID productId,
    String sku,
    BigDecimal oldPrice,
    BigDecimal newPrice,
    Instant occurredAt
) implements DomainEvent {
    public static ProductPriceChangedEvent from(Product p, BigDecimal oldPrice, Instant now) {
        return new ProductPriceChangedEvent(UUID.randomUUID(), p.getId(), p.getSku(),
            oldPrice, p.getCurrentPrice(), now);
    }
}
