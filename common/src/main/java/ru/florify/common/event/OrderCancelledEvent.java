package ru.florify.common.event;

import java.time.Instant;
import java.util.UUID;

/**
 * Kafka event published by order-service when an order is cancelled.
 */
public record OrderCancelledEvent(
    UUID eventId,
    UUID orderId,
    UUID customerId,
    int bonusPointsUsed,
    Instant occurredAt
) {
    public static OrderCancelledEvent of(UUID orderId, UUID customerId, int bonusPointsUsed, Instant now) {
        return new OrderCancelledEvent(UUID.randomUUID(), orderId, customerId, bonusPointsUsed, now);
    }
}
