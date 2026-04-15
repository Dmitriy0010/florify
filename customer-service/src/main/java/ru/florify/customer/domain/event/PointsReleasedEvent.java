package ru.florify.customer.domain.event;

import ru.florify.common.domain.event.DomainEvent;
import java.time.Instant;
import java.util.UUID;

public record PointsReleasedEvent(
    UUID eventId,
    UUID customerId,
    UUID orderId,
    int pointsReleased,
    Instant occurredAt
) implements DomainEvent {
}
