package ru.florify.delivery.adapter.in.web.dto;

import ru.florify.delivery.domain.model.TaskStatus;

import java.time.Instant;
import java.util.UUID;

/**
 * Ответ с данными задачи доставки.
 */
public record DeliveryTaskResponse(
        UUID id,
        UUID orderId,
        UUID slotId,
        UUID zoneId,
        UUID courierId,
        String deliveryAddress,
        Double latitude,
        Double longitude,
        TaskStatus status,
        Instant estimatedArrival,
        Instant actualDeliveredAt,
        String failureReason,
        Instant createdAt,
        Instant updatedAt
) {}
