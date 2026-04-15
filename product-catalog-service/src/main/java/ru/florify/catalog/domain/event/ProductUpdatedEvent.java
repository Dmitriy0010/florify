package ru.florify.catalog.domain.event;

import ru.florify.catalog.domain.model.Product;
import ru.florify.common.domain.event.DomainEvent;

import java.time.Instant;
import java.util.UUID;

public record ProductUpdatedEvent(
    UUID eventId,
    UUID productId,
    String name,
    UUID categoryId,
    int defaultShelfLifeDays,
    Instant occurredAt
) implements DomainEvent {
    public static ProductUpdatedEvent from(Product p, Instant now) {
        return new ProductUpdatedEvent(UUID.randomUUID(), p.getId(), p.getName(),
            p.getCategoryId(), p.getDefaultShelfLifeDays(), now);
    }
}
