package ru.florify.catalog.adapter.in.web.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record ProductSummaryResponse(
    UUID id,
    String sku,
    String name,
    BigDecimal currentPrice,
    String imageUrl,
    boolean active
) {}
