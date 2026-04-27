package ru.florify.common.event;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

/**
 * Оповещение о списании товара (inventory-service).
 */
public record StockWrittenOffSpringEvent(
        UUID sourceDocumentId, // Идентификатор для идемпотентности
        UUID productId,
        UUID storeId,
        BigDecimal totalValue, // Сумма списания в закупочных ценах (потеря)
        String reason,
        Instant occurredAt
) {
    public static StockWrittenOffSpringEvent of(UUID sourceDocumentId, UUID productId, UUID storeId, BigDecimal totalValue, String reason, Instant now) {
        return new StockWrittenOffSpringEvent(sourceDocumentId, productId, storeId, totalValue, reason, now);
    }
}
