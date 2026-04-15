package ru.florify.catalog.adapter.in.web.dto;

import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.util.UUID;

public record BulkPriceUpdateRequest(
    @NotNull UUID categoryId,
    @NotNull BigDecimal markupPercent
) {}
