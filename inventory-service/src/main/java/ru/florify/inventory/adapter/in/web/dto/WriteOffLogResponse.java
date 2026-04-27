package ru.florify.inventory.adapter.in.web.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record WriteOffLogResponse(
    UUID id,
    UUID productId,
    UUID storeId,
    BigDecimal quantity,
    BigDecimal totalValue,
    String reason,
    String comment,
    Instant createdAt
) {}
