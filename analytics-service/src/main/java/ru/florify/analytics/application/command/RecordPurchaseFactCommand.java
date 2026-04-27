package ru.florify.analytics.application.command;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record RecordPurchaseFactCommand(
        UUID invoiceId,
        UUID supplierId,
        UUID storeId,
        String supplierName,
        BigDecimal totalAmount,
        Integer itemCount,
        Instant receivedAt
) {}
