package ru.florify.common.event;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

/**
 * Shared domain event published when an order is confirmed and ready for fulfillment.
 * Consumed by inventory-service to write off stock.
 */
public record OrderConfirmedEvent(
        UUID orderId,
        UUID storeId,
        UUID performerId,
        List<OrderItem> items
) {
    public record OrderItem(
            UUID productId,
            BigDecimal quantity,
            BigDecimal price
    ) {}
}
