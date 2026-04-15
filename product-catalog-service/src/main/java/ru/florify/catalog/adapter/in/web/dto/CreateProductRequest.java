package ru.florify.catalog.adapter.in.web.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import ru.florify.common.domain.enums.UnitOfMeasure;

import java.math.BigDecimal;
import java.util.UUID;

public record CreateProductRequest(
    @NotBlank String name,
    String description,
    @NotNull UUID categoryId,
    @NotNull UnitOfMeasure unit,
    @NotNull @Positive BigDecimal initialPrice,
    String imageUrl,
    int defaultShelfLifeDays
) {}
