package ru.florify.catalog.domain.event;

import ru.florify.catalog.domain.model.Product;
import ru.florify.common.domain.event.DomainEvent;

import java.time.Instant;
import java.util.UUID;

public record ProductDeactivatedEvent(
    UUID eventId,
    UUID productId,
    String sku,
    Instant occurredAt
) implements DomainEvent {
    public static ProductDeactivatedEvent from(Product p, Instant now) {
        return new ProductDeactivatedEvent(UUID.randomUUID(), p.getId(), p.getSku(), now);
    }
}
