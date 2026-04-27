package ru.florify.inventory.adapter.in.web.dto;

import ru.florify.inventory.domain.model.BatchStatus;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record StockBatchDto(
    UUID id,
    UUID supplierId,
    String supplierName,  // enriched by supplier lookup (optional)
    BigDecimal quantityReceived,
    BigDecimal quantityRemaining,
    BigDecimal unitCost,
    Instant receivedAt,
    Instant expiresAt,
    BatchStatus status,
    String sourceDocumentId
) {}
