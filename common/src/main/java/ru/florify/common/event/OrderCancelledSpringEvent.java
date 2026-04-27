package ru.florify.common.event;

import java.time.Instant;
import java.util.UUID;

/**
 * Общее событие отмены заказа, публикуемое через Spring ApplicationEventPublisher.
 *
 * Источник: order-service (UpdateOrderStatusInteractor при CANCELLED).
 * Потребители: delivery-service (отменяет задачу доставки, освобождает слот).
 */
public record OrderCancelledSpringEvent(
        UUID orderId,
        UUID customerId,
        Instant occurredAt
) {
    public static OrderCancelledSpringEvent of(UUID orderId, UUID customerId, Instant now) {
        return new OrderCancelledSpringEvent(orderId, customerId, now);
    }
}
