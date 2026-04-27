package ru.florify.common.event;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

/**
 * Оповещение о завершении заказа (статус COMPLETED).
 * Публикуется модулем order-service.
 */
public record OrderCompletedSpringEvent(
        UUID orderId,
        UUID customerId,
        UUID storeId,
        BigDecimal finalAmount,
        BigDecimal totalCogs,
        List<ItemInfo> items,
        Instant occurredAt
) {
    public static OrderCompletedSpringEvent of(UUID orderId, UUID customerId, UUID storeId, BigDecimal finalAmount, BigDecimal totalCogs, List<ItemInfo> items, Instant now) {
        return new OrderCompletedSpringEvent(orderId, customerId, storeId, finalAmount, totalCogs, items, now);
    }

    public record ItemInfo(UUID productId, BigDecimal quantity) {}
}
