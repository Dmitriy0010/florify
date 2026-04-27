package ru.florify.supplier.adapter.in.web.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record CreateInvoiceRequest(
        @NotNull UUID supplierId,
        @NotNull UUID storeId,
        @NotBlank String invoiceNumber,
        Instant plannedDeliveryAt,
        String comment,
        @Valid List<CreateInvoiceItemRequest> items
) {}
