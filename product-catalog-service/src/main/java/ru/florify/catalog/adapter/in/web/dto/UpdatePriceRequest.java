package ru.florify.catalog.adapter.in.web.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;

public record UpdatePriceRequest(
    @NotNull @Positive BigDecimal newPrice,
    String reason
) {}
