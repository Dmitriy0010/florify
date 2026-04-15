package ru.florify.order.domain.event;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record OrderCancelledEvent(
        UUID eventId,
        UUID orderId,
        UUID customerId,
        int bonusPointsUsed,
        Instant occurredAt
) {}
