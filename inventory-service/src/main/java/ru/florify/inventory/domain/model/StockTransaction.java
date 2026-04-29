package ru.florify.inventory.domain.model;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record StockTransaction(
        UUID id,
        UUID productId,
        UUID storeId,
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
            UUID storeId,
            BigDecimal quantity,
            BigDecimal price,
            String sourceDocumentId,
            UUID performerId,
            Instant createdAt
    ) {
        return new StockTransaction(
                UUID.randomUUID(),
                productId,
                storeId,
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
            UUID storeId,
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
                storeId,
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

    public static StockTransaction forOutbound(
            UUID productId,
            UUID storeId,
            BigDecimal quantity,
            BigDecimal currentAverageCost,
            String comment,
            String sourceDocumentId,
            UUID performerId,
            Instant createdAt
    ) {
        return new StockTransaction(
                UUID.randomUUID(),
                productId,
                storeId,
                TransactionType.OUTBOUND,
                quantity,
                currentAverageCost,
                quantity.multiply(currentAverageCost),
                WriteOffReason.SALE,
                comment,
                sourceDocumentId,
                performerId,
                createdAt
        );
    }
}

