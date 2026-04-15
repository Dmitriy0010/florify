package ru.florify.catalog.adapter.in.web.dto;

import ru.florify.common.domain.enums.UnitOfMeasure;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record ProductResponse(
    UUID id,
    String sku,
    String name,
    String description,
    UUID categoryId,
    UnitOfMeasure unit,
    BigDecimal currentPrice,
    String imageUrl,
    int defaultShelfLifeDays,
    boolean active,
    int version,
    Instant createdAt,
    Instant updatedAt
) {}
