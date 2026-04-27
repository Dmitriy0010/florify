package ru.florify.common.event;

import ru.florify.common.domain.event.DomainEvent;
import java.time.Instant;
import java.util.UUID;

public record PointsReservedEvent(
    UUID customerId,
    UUID orderId,
    int points,
    int newReserved,
    Instant occurredAt
) implements DomainEvent {
}
