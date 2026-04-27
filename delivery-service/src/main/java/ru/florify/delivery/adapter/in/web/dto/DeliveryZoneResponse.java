package ru.florify.delivery.adapter.in.web.dto;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * Ответ с данными зоны доставки.
 */
public record DeliveryZoneResponse(
        UUID id,
        String name,
        String polygon,
        BigDecimal deliveryFee,
        BigDecimal minOrderAmount,
        boolean active
) {}
