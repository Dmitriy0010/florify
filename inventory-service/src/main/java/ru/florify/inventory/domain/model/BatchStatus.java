package ru.florify.inventory.domain.model;

public enum BatchStatus {
    AVAILABLE,   // доступна для использования
    EXPIRED,     // истёк срок годности
    DEPLETED,    // полностью использована
    RESERVED     // зарезервирована (для будущего)
}
