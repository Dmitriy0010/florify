package ru.florify.delivery.domain.model;

import java.util.Set;

/**
 * Конечный автомат статусов задачи доставки.
 * Инкапсулирует правила допустимых переходов — по аналогии с OrderStatus.
 */
public enum TaskStatus {
    CREATED,     // Задача создана, курьер не назначен
    ASSIGNED,    // Курьер назначен, едет за заказом
    PICKED_UP,   // Курьер забрал заказ, едет к клиенту
    DELIVERED,   // Доставка выполнена успешно (финальный)
    FAILED;      // Доставка не удалась (финальный, пересоздается через новую команду)

    private static final Set<TaskStatus> FINAL_STATUSES = Set.of(DELIVERED, FAILED);

    /**
     * Является ли статус финальным (переходы из него запрещены).
     */
    public boolean isFinal() {
        return FINAL_STATUSES.contains(this);
    }

    /**
     * Допустим ли переход из текущего статуса в указанный.
     */
    public boolean canTransitionTo(TaskStatus next) {
        return switch (this) {
            case CREATED   -> next == ASSIGNED || next == FAILED;
            case ASSIGNED  -> next == PICKED_UP || next == FAILED;
            case PICKED_UP -> next == DELIVERED || next == FAILED;
            case DELIVERED, FAILED -> false;
        };
    }
}
