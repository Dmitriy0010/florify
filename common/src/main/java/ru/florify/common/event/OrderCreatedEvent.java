package ru.florify.common.event;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

/**
 * Kafka event published by order-service when a new order is created.
 */
public record OrderCreatedEvent(
    UUID orderId,
    UUID customerId,
    UUID storeId,
    int bonusPointsUsed,
    BigDecimal totalAmount,
    Instant occurredAt
) {
    public static OrderCreatedEvent of(UUID orderId, UUID customerId, UUID storeId, int bonusPointsUsed, BigDecimal totalAmount, Instant now) {
        return new OrderCreatedEvent(orderId, customerId, storeId, bonusPointsUsed, totalAmount, now);
    }
}
