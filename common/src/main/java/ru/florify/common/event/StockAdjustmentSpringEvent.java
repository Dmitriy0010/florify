package ru.florify.common.event;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

/**
 * Внутреннее событие о корректировке склада (излишки или недостача).
 * Слушается финансовым сервисом для записи доходов/расходов.
 */
public record StockAdjustmentSpringEvent(
        UUID productId,
        UUID storeId,
        BigDecimal quantity,
        BigDecimal amount,
        String sourceDocument,
        AdjustmentType type,
        Instant occurredAt
) {
    public enum AdjustmentType {
        SURPLUS,  // Излишек (Доход)
        LOSS      // Недостача (Расход)
    }
}
