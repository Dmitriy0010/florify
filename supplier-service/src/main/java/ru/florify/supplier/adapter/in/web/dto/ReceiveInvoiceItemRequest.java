package ru.florify.supplier.adapter.in.web.dto;

import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.util.UUID;

public record ReceiveInvoiceItemRequest(
        @NotNull UUID itemId,
        @NotNull BigDecimal receivedQuantity
) {}
