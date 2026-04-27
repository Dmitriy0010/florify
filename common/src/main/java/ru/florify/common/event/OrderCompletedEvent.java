package ru.florify.common.event;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

/**
 * Kafka event published by order-service when an order is completed.
 */
public record OrderCompletedEvent(
    UUID orderId,
    UUID customerId,
    UUID storeId,
    int bonusPointsUsed,
    BigDecimal finalAmount,
    UUID floristId,
    Instant occurredAt
) {
    public static OrderCompletedEvent of(UUID orderId, UUID customerId, UUID storeId, int bonusPointsUsed, BigDecimal finalAmount, UUID floristId, Instant now) {
        return new OrderCompletedEvent(orderId, customerId, storeId, bonusPointsUsed, finalAmount, floristId, now);
    }
}
