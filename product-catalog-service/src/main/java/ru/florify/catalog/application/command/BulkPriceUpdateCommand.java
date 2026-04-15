package ru.florify.catalog.application.command;

import java.math.BigDecimal;
import java.util.UUID;

public record BulkPriceUpdateCommand(
    UUID categoryId,
    BigDecimal markupPercent, // e.g., 10.0 = +10%
    UUID performerId
) {}
