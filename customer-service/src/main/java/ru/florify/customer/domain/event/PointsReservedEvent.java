package ru.florify.customer.domain.event;

import ru.florify.common.domain.event.DomainEvent;
import java.time.Instant;
import java.util.UUID;

public record PointsReservedEvent(
    UUID eventId,
    UUID customerId,
    UUID orderId,
    int points,
    int newReserved,
    Instant occurredAt
) implements DomainEvent {
}
