package ru.florify.order.domain.model;

import java.util.Set;

public enum OrderStatus {
    PENDING_STOCK,      // Создан, ждём ответа от inventory
    NEW,                // inventory подтвердил наличие товара
    CONFIRMED,          // флорист взял в работу (или auto-confirm)
    IN_PROGRESS,        // флорист собирает
    READY,              // готов к выдаче/доставке
    OUT_FOR_DELIVERY,   // курьер забрал
    COMPLETED,          // финальный
    CANCELLED;          // финальный

    private static final Set<OrderStatus> FINAL_STATUSES = Set.of(COMPLETED, CANCELLED);
    private static final Set<OrderStatus> CANCELLABLE_STATUSES = Set.of(
            PENDING_STOCK, NEW, CONFIRMED, IN_PROGRESS, READY
    );

    public boolean isFinal() {
        return FINAL_STATUSES.contains(this);
    }

    public boolean canBeCancelled() {
        return CANCELLABLE_STATUSES.contains(this);
    }

    public boolean canTransitionTo(OrderStatus newStatus) {
        return switch (this) {
            case PENDING_STOCK -> newStatus == NEW || newStatus == CANCELLED;
            case NEW -> newStatus == CONFIRMED || newStatus == IN_PROGRESS || newStatus == CANCELLED;
            case CONFIRMED -> newStatus == IN_PROGRESS || newStatus == COMPLETED || newStatus == CANCELLED;
            case IN_PROGRESS -> newStatus == READY || newStatus == COMPLETED || newStatus == CANCELLED;
            case READY -> newStatus == OUT_FOR_DELIVERY || newStatus == COMPLETED || newStatus == CANCELLED;
            case OUT_FOR_DELIVERY -> newStatus == COMPLETED;
            case COMPLETED, CANCELLED -> false;
        };
    }
}
