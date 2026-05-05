package ru.florify.delivery.application.command;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * Команда обновления существующей зоны доставки.
 */
public record UpdateDeliveryZoneCommand(
        UUID zoneId,
        String name,
        String polygon,
        BigDecimal deliveryFee,
        BigDecimal minOrderAmount,
        boolean active,
        UUID performerId
) {}
