package ru.florify.supplier.adapter.in.web.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record InvoiceItemResponse(
        UUID id,
        UUID productId,
        String productName,
        BigDecimal orderedQuantity,
        BigDecimal receivedQuantity,
        BigDecimal unitPrice,
        LocalDate expiresAt
) {}
