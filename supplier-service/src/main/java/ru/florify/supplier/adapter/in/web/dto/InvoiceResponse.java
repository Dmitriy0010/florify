package ru.florify.supplier.adapter.in.web.dto;

import ru.florify.supplier.domain.model.InvoiceStatus;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record InvoiceResponse(
        UUID id,
        String invoiceNumber,
        UUID supplierId,
        String supplierName,
        UUID storeId,
        InvoiceStatus status,
        BigDecimal totalAmount,
        Instant plannedDeliveryAt,
        Instant receivedAt,
        String comment,
        UUID createdBy,
        Instant createdAt,
        List<InvoiceItemResponse> items
) {}
