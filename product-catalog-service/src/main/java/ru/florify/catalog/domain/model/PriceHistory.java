package ru.florify.catalog.domain.model;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record PriceHistory(
    UUID id,
    UUID productId,
    BigDecimal oldPrice,
    BigDecimal newPrice,
    UUID performerId,       // Who changed the price (from JWT)
    String reason,          // nullable, comment on the change
    Instant occurredAt
) {}
