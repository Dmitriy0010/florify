package ru.florify.delivery.domain.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import ru.florify.delivery.domain.exception.InvalidTaskStatusTransitionException;

import java.time.Instant;
import java.util.UUID;

/**
 * Главный агрегат сервиса доставки — задача доставки конкретного заказа.
 *
 * Жизненный цикл управляется через конечный автомат TaskStatus.
 * Все переходы статусов инкапсулированы в доменных методах, которые
 * бросают InvalidTaskStatusTransitionException при нарушении FSM.
 *
 * Принципы:
 * - orderId — только UUID, без join на order-service (Dependency Rule).
 * - courierId — только UUID, без join на employee-service.
 * - deliveryAddress — снимок адреса на момент создания (денормализация).
 * - updatedAt устанавливается Application-слоем, не @PreUpdate.
 */
@Getter
@Setter
@Builder(toBuilder = true)
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class DeliveryTask {

    @EqualsAndHashCode.Include
    private UUID id;

    /**
     * ID заказа из order-service. Уникальный индекс в БД — один заказ = одна задача.
     */
    private UUID orderId;

    /** ID слота доставки (nullable — самовывоз или назначение позже). */
    private UUID slotId;

    /** ID зоны доставки (nullable — определяется по адресу). */
    private UUID zoneId;

    /** ID курьера из employee-service (nullable — назначается позже). */
    private UUID courierId;

    /** Снимок адреса доставки на момент создания задачи (денормализация). */
    private String deliveryAddress;

    /** Координаты геокодированного адреса (nullable). */
    private Double latitude;
    private Double longitude;

    private TaskStatus status;

    /** Расчётное время прибытия курьера (nullable). */
    private Instant estimatedArrival;

    /** Фактическое время доставки (заполняется при deliver()). */
    private Instant actualDeliveredAt;

    /** Причина провала доставки (заполняется при fail()). */
    private String failureReason;

    private Instant createdAt;
    private Instant updatedAt;

    // ─────────────────────────────────────────────────────────
    // Доменная логика — конечный автомат
    // ─────────────────────────────────────────────────────────

    /**
     * Назначить курьера на задачу.
     * Допустимо из статуса CREATED (первичное назначение) или ASSIGNED (переназначение).
     *
     * @param courierId ID курьера
     * @param now       текущий момент времени из Application-слоя
     * @return обновлённый экземпляр задачи
     */
    public DeliveryTask assignCourier(UUID courierId, Instant now) {
        if (this.status != TaskStatus.CREATED && this.status != TaskStatus.ASSIGNED) {
            throw new InvalidTaskStatusTransitionException(this.status, TaskStatus.ASSIGNED);
        }
        return this.toBuilder()
                .courierId(courierId)
                .status(TaskStatus.ASSIGNED)
                .updatedAt(now)
                .build();
    }

    /**
     * Курьер забрал заказ у флориста.
     * Переход: ASSIGNED → PICKED_UP.
     *
     * @param now текущий момент времени из Application-слоя
     * @return обновлённый экземпляр задачи
     */
    public DeliveryTask pickUp(Instant now) {
        if (!this.status.canTransitionTo(TaskStatus.PICKED_UP)) {
            throw new InvalidTaskStatusTransitionException(this.status, TaskStatus.PICKED_UP);
        }
        return this.toBuilder()
                .status(TaskStatus.PICKED_UP)
                .updatedAt(now)
                .build();
    }

    /**
     * Заказ доставлен клиенту.
     * Переход: PICKED_UP → DELIVERED (финальный).
     *
     * @param now текущий момент времени из Application-слоя
     * @return обновлённый экземпляр задачи
     */
    public DeliveryTask deliver(Instant now) {
        if (!this.status.canTransitionTo(TaskStatus.DELIVERED)) {
            throw new InvalidTaskStatusTransitionException(this.status, TaskStatus.DELIVERED);
        }
        return this.toBuilder()
                .status(TaskStatus.DELIVERED)
                .actualDeliveredAt(now)
                .updatedAt(now)
                .build();
    }

    /**
     * Доставка не удалась.
     * Переход в FAILED возможен из CREATED, ASSIGNED или PICKED_UP.
     *
     * @param reason причина неудачи (обязательна)
     * @param now    текущий момент времени из Application-слоя
     * @return обновлённый экземпляр задачи
     */
    public DeliveryTask fail(String reason, Instant now) {
        if (!this.status.canTransitionTo(TaskStatus.FAILED)) {
            throw new InvalidTaskStatusTransitionException(this.status, TaskStatus.FAILED);
        }
        return this.toBuilder()
                .status(TaskStatus.FAILED)
                .failureReason(reason)
                .updatedAt(now)
                .build();
    }
}
