package ru.florify.inventory.domain.event;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record StockExpiredEvent(
        UUID eventId,
        UUID productId,
        BigDecimal quantityExpired,
        Instant occurredAt
) {
    public static StockExpiredEvent from(UUID productId, BigDecimal quantity, Instant now) {
        return new StockExpiredEvent(UUID.randomUUID(), productId, quantity, now);
    }
}
