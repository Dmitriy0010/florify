package ru.florify.inventory.domain.event;

import ru.florify.inventory.domain.model.StockTransaction;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

/**
 * Domain event for stock write-off.
 * Isolation rule: Primitive types (String) for fields shared with other services.
 */
public record StockWrittenOffEvent(
        UUID eventId,
        UUID productId,
        BigDecimal quantity,
        BigDecimal costBasis,
        BigDecimal totalValue,
        String reason,
        String sourceDocumentId,
        UUID performerId,
        Instant occurredAt
) {
    public static StockWrittenOffEvent from(StockTransaction transaction) {
        return new StockWrittenOffEvent(
                UUID.randomUUID(), // Unique identifier for idempotency
                transaction.productId(),
                transaction.quantity(),
                transaction.costBasis(),
                transaction.totalValue(),
                transaction.writeOffReason() != null ? transaction.writeOffReason().name() : "OTHER",
                transaction.sourceDocumentId(),
                transaction.performerId(),
                transaction.createdAt()
        );
    }
}
