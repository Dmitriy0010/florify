package ru.florify.catalog.application.command;

import java.math.BigDecimal;
import java.util.UUID;

public record UpdatePriceCommand(
    UUID productId,
    BigDecimal newPrice,
    String reason,            // nullable
    UUID performerId
) {}
