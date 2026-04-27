package ru.florify.delivery.adapter.in.web.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.Instant;
import java.util.UUID;

/**
 * Запрос на ручное создание задачи доставки (ADMIN).
 */
public record CreateDeliveryTaskRequest(
        @NotNull UUID orderId,
        UUID slotId,
        UUID zoneId,
        @NotBlank String deliveryAddress,
        Double latitude,
        Double longitude,
        Instant estimatedArrival
) {}
