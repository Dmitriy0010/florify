package ru.florify.catalog.application.command;

import ru.florify.common.domain.enums.UnitOfMeasure;
import java.math.BigDecimal;
import java.util.UUID;

public record CreateProductCommand(
    String name,
    String description,
    UUID categoryId,
    UnitOfMeasure unit,
    BigDecimal initialPrice,
    String imageUrl,          // nullable
    int defaultShelfLifeDays,
    UUID performerId          // from JWT
) {}
