package ru.florify.common.event;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

/**
 * Оповещение о рассчитанной себестоимости (COGS) заказа.
 * Публикуется модулем inventory-service после списания товара по FIFO.
 */
public record OrderCogsCalculatedSpringEvent(
        UUID orderId,
        BigDecimal totalCogs,
        Instant occurredAt
) {
    public static OrderCogsCalculatedSpringEvent of(UUID orderId, BigDecimal totalCogs, Instant now) {
        return new OrderCogsCalculatedSpringEvent(orderId, totalCogs, now);
    }
}
