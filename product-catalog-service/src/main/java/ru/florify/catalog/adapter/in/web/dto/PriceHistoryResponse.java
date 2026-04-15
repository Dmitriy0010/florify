package ru.florify.catalog.adapter.in.web.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record PriceHistoryResponse(
    UUID id,
    BigDecimal oldPrice,
    BigDecimal newPrice,
    UUID performerId,
    String reason,
    Instant occurredAt
) {}
