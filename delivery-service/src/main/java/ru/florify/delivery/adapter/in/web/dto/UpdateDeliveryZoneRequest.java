package ru.florify.delivery.adapter.in.web.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

/**
 * Запрос на обновление зоны доставки.
 */
public record UpdateDeliveryZoneRequest(
        @NotBlank String name,
        String polygon,
        @NotNull @DecimalMin("0.00") BigDecimal deliveryFee,
        @NotNull @DecimalMin("0.00") BigDecimal minOrderAmount,
        boolean active
) {}
