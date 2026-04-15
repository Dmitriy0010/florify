package ru.florify.customer.domain.event;

import ru.florify.common.domain.event.DomainEvent;
import java.time.Instant;
import java.util.UUID;

public record PointsConfirmedEvent(
    UUID eventId,
    UUID customerId,
    UUID orderId,
    int pointsDeducted,
    int pointsEarned,
    int newBalance,
    Instant occurredAt
) implements DomainEvent {
}
