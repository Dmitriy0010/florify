package ru.florify.order.domain.event;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record OrderCreatedEvent(
        UUID eventId,
        UUID orderId,
        String orderNumber,
        UUID customerId,
        BigDecimal finalAmount,
        int bonusPointsUsed,
        Instant createdAt,
        Instant occurredAt
) {}
