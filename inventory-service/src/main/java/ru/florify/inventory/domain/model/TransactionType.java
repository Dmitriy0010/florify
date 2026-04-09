package ru.florify.inventory.domain.model;

public enum TransactionType {
    INBOUND,               // Оприходование
    OUTBOUND,              // Продажа
    WRITE_OFF,             // Списание брака
    INVENTORY_ADJUSTMENT   // Корректировка после ревизии
}
