package ru.florify.inventory.domain.model;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record StockTransaction(
        UUID id,
        UUID productId,
        TransactionType type,
        BigDecimal quantity,
        BigDecimal costBasis,
        BigDecimal totalValue,
        WriteOffReason writeOffReason,
        String comment,
        String sourceDocumentId,
        UUID performerId,
        Instant createdAt
) {
    public static StockTransaction forInbound(
            UUID productId,
            BigDecimal quantity,
            BigDecimal price,
            String sourceDocumentId,
            UUID performerId,
            Instant createdAt
    ) {
        return new StockTransaction(
                UUID.randomUUID(),
                productId,
                TransactionType.INBOUND,
                quantity,
                price,
                quantity.multiply(price),
                null,
                "Stock receipt",
                sourceDocumentId,
                performerId,
                createdAt
        );
    }

    public static StockTransaction forWriteOff(
            UUID productId,
            BigDecimal quantity,
            BigDecimal currentAverageCost,
            WriteOffReason reason,
            String comment,
            String sourceDocumentId,
            UUID performerId,
            Instant createdAt
    ) {
        return new StockTransaction(
                UUID.randomUUID(),
                productId,
                TransactionType.WRITE_OFF,
                quantity,
                currentAverageCost,
                quantity.multiply(currentAverageCost),
                reason,
                comment,
                sourceDocumentId,
                performerId,
                createdAt
        );
    }
}
