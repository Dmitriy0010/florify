package ru.florify.supplier.application.command;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record CreateInvoiceItemCommand(
        UUID productId,
        String productName,
        BigDecimal orderedQuantity,
        BigDecimal unitPrice,
        LocalDate expiresAt
) {}
