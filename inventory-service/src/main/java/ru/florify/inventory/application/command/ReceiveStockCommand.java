package ru.florify.inventory.application.command;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record ReceiveStockCommand(
        UUID productId,
        UUID storeId,
        UUID supplierId,
        BigDecimal quantity,
        BigDecimal purchasePrice,
        String sourceDocumentId,
        UUID performerId,
        Instant expiresAt
) {}
