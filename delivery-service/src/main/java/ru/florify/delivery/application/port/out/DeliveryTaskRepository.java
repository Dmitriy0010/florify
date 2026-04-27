package ru.florify.delivery.application.port.out;

import ru.florify.delivery.domain.model.DeliveryTask;
import ru.florify.delivery.domain.model.TaskStatus;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Выходной порт (SPI) для работы с задачами доставки.
 *
 * Правило манифеста: нет Pageable, нет Page<T>, нет JPA-импортов.
 * Реализуется в DeliveryTaskPersistenceAdapter (adapter/out).
 */
public interface DeliveryTaskRepository {

    DeliveryTask save(DeliveryTask task);

    Optional<DeliveryTask> findById(UUID id);

    /**
     * Найти задачу по ID заказа.
     * Гарантирован UNIQUE-индекс в БД — один заказ = одна задача.
     */
    Optional<DeliveryTask> findByOrderId(UUID orderId);

    List<DeliveryTask> findByCourierId(UUID courierId);

    /**
     * Найти задачи по статусу и дате слота.
     * Дата берётся из связанного DeliverySlot (JOIN по slotId).
     */
    List<DeliveryTask> findByStatusAndDate(TaskStatus status, LocalDate date);

    /**
     * Удалить задачу по ID заказа (при отмене заказа до финального статуса).
     */
    void deleteByOrderId(UUID orderId);

    boolean existsByOrderId(UUID orderId);
}
