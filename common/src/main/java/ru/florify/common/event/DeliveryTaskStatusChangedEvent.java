package ru.florify.common.event;

import java.time.Instant;
import java.util.UUID;

/**
 * Доменное событие об изменении статуса задачи доставки.
 *
 * Публикуется через Spring ApplicationEventPublisher из:
 * - AssignCourierInteractor (CREATED → ASSIGNED)
 * - UpdateTaskStatusInteractor (все прочие переходы)
 *
 * Потребители (через @EventListener в монолите):
 * - order-service: обновить статус заказа на OUT_FOR_DELIVERY / COMPLETED
 * - notification-service: уведомить клиента об изменении статуса доставки
 *
 * Используется record по правилам манифеста — процессы иммутабельны.
 */
public record DeliveryTaskStatusChangedEvent(
        UUID taskId,
        UUID orderId,
        UUID courierId,
        String previousStatus,
        String newStatus,
        String failureReason,
        Instant occurredAt
) {
    public static DeliveryTaskStatusChangedEvent of(
            UUID taskId,
            UUID orderId,
            UUID courierId,
            String previousStatus,
            String newStatus,
            String failureReason,
            Instant now
    ) {
        return new DeliveryTaskStatusChangedEvent(
                taskId, orderId, courierId, previousStatus, newStatus, failureReason, now
        );
    }
}
