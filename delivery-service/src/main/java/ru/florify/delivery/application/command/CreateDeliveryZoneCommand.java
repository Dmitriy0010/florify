package ru.florify.delivery.application.command;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * Команда создания новой зоны доставки.
 * record — иммутабельный объект передачи данных (по правилам манифеста).
 */
public record CreateDeliveryZoneCommand(
        String name,
        String polygon,
        BigDecimal deliveryFee,
        BigDecimal minOrderAmount,
        UUID performerId
) {}
