package ru.florify.inventory.domain.model;

public enum WriteOffReason {
    SPOILAGE,       // Увядание / сгнил
    DAMAGE,         // Поломка (сломался стебель)
    INVENTORY_LOSS, // Недостача при инвентаризации
    SALE            // Продажа (автоматическое списание)
}
