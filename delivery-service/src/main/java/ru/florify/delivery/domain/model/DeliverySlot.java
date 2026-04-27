package ru.florify.delivery.domain.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import ru.florify.delivery.domain.exception.SlotCapacityExceededException;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

/**
 * Доменная сущность временного слота доставки.
 *
 * Ключевой инвариант: currentLoad <= maxCapacity.
 * Нарушение инварианта → SlotCapacityExceededException.
 *
 * currentLoad — денормализованный счётчик: избегаем COUNT-запросов
 * при каждом создании задачи доставки.
 */
@Getter
@Setter
@Builder(toBuilder = true)
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class DeliverySlot {

    @EqualsAndHashCode.Include
    private UUID id;

    private LocalDate date;
    private LocalTime startTime;
    private LocalTime endTime;

    /**
     * Максимальное количество задач доставки в данный слот.
     */
    private int maxCapacity;

    /**
     * Текущее количество забронированных задач.
     * Изменяется методами reserve() и release() с соблюдением инварианта.
     */
    private int currentLoad;

    /**
     * Забронировать одно место в слоте.
     * Вызывается при создании DeliveryTask с привязкой к этому слоту.
     *
     * @throws SlotCapacityExceededException если слот уже заполнен
     */
    public void reserve() {
        if (currentLoad >= maxCapacity) {
            throw new SlotCapacityExceededException(id, maxCapacity);
        }
        this.currentLoad++;
    }

    /**
     * Освободить одно место в слоте.
     * Вызывается при отмене задачи доставки или завершении доставки.
     * Никогда не уходит в минус.
     */
    public void release() {
        if (this.currentLoad > 0) {
            this.currentLoad--;
        }
    }

    /**
     * Проверить, заполнен ли слот.
     */
    public boolean isFull() {
        return currentLoad >= maxCapacity;
    }
}
