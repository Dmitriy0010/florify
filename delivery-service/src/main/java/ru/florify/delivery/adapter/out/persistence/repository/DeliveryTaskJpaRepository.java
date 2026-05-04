package ru.florify.delivery.adapter.out.persistence.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import ru.florify.delivery.adapter.out.persistence.entity.DeliveryTaskJpaEntity;
import ru.florify.delivery.domain.model.TaskStatus;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface DeliveryTaskJpaRepository extends JpaRepository<DeliveryTaskJpaEntity, UUID> {

    Optional<DeliveryTaskJpaEntity> findByOrderId(UUID orderId);

    List<DeliveryTaskJpaEntity> findAllByCourierId(UUID courierId);

    List<DeliveryTaskJpaEntity> findAllByCourierIdOrderByEstimatedArrivalAsc(UUID courierId);

    List<DeliveryTaskJpaEntity> findByStatusAndCourierIdIsNullOrderByEstimatedArrivalAsc(TaskStatus status);

    boolean existsByOrderId(UUID orderId);

    void deleteByOrderId(UUID orderId);

    /**
     * Поиск задач по статусу и дате слота (JOIN с delivery_slots).
     * Задачи без слота (slotId = null) в результаты не попадают.
     */
    @Query("""
            SELECT t FROM DeliveryTaskJpaEntity t
            JOIN DeliverySlotJpaEntity s ON t.slotId = s.id
            WHERE t.status IN :statuses AND s.date = :date
            """)
    List<DeliveryTaskJpaEntity> findByStatusesAndSlotDate(
            @Param("statuses") java.util.Collection<TaskStatus> statuses,
            @Param("date") LocalDate date
    );
}
