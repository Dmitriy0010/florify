package ru.florify.inventory.domain.event;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

/**
 * Domain event published when new stock is received and added to inventory.
 */
public record StockReceivedEvent(
        UUID eventId,
        UUID batchId,
        UUID productId,
        BigDecimal quantity,
        BigDecimal unitCost,
        Instant occurredAt
) {
    public static StockReceivedEvent of(UUID batchId, UUID productId, BigDecimal quantity, BigDecimal unitCost, Instant now) {
        return new StockReceivedEvent(UUID.randomUUID(), batchId, productId, quantity, unitCost, now);
    }
}
