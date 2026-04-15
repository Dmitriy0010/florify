package ru.florify.catalog.domain.event;

import ru.florify.catalog.domain.model.Product;
import ru.florify.common.domain.event.DomainEvent;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record ProductCreatedEvent(
    UUID eventId,
    UUID productId,
    String sku,
    String name,
    UUID categoryId,
    BigDecimal initialPrice,
    String unit,           // UnitOfMeasure.name()
    int defaultShelfLifeDays,
    Instant occurredAt
) implements DomainEvent {
    public static ProductCreatedEvent from(Product p, Instant now) {
        return new ProductCreatedEvent(UUID.randomUUID(), p.getId(), p.getSku(),
            p.getName(), p.getCategoryId(), p.getCurrentPrice(),
            p.getUnit().name(), p.getDefaultShelfLifeDays(), now);
    }
}
