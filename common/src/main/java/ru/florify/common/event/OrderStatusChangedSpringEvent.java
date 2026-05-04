package ru.florify.common.event;

import java.time.Instant;
import java.util.UUID;

/**
 * Общее событие изменения статуса заказа, публикуемое через Spring ApplicationEventPublisher.
 *
 * Источник: order-service (UpdateOrderStatusInteractor).
 * Потребители: delivery-service (создаёт DeliveryTask при OUT_FOR_DELIVERY).
 *
 * Примечание: orderId и address передаются чтобы delivery-service мог создать задачу
 * без обратного вызова к order-service (избегаем tight coupling).
 */
public record OrderStatusChangedSpringEvent(
        UUID orderId,
        String previousStatus,
        String newStatus,
        String deliveryAddress,
        String orderType, // DELIVERY or PICKUP
        UUID deliverySlotId,
        UUID customerId,
        Instant occurredAt
) {
    public static OrderStatusChangedSpringEvent of(
            UUID orderId,
            String previousStatus,
            String newStatus,
            String deliveryAddress,
            String orderType,
            UUID deliverySlotId,
            UUID customerId,
            Instant now
    ) {
        return new OrderStatusChangedSpringEvent(
                orderId, previousStatus, newStatus, deliveryAddress, orderType, deliverySlotId, customerId, now
        );
    }
}
