package ru.florify.analytics.domain.enums;

/**
 * Reasons for stock write-off.
 * Synchronized with inventory-service domain.
 */
public enum WriteoffReason {
    SPOILAGE,       // Увядание / сгнил
    DAMAGE,         // Поломка (сломался стебель)
    INVENTORY_LOSS, // Недостача при инвентаризации
    EXPIRED,        // Просрочен
    SALE            // Продажа (авто-списание при заказе)
}
