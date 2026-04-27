package ru.florify.supplier.adapter.in.web.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record CreateInvoiceItemRequest(
        @NotNull UUID productId,
        @NotBlank String productName,
        @NotNull BigDecimal orderedQuantity,
        @NotNull BigDecimal unitPrice,
        LocalDate expiresAt
) {}
