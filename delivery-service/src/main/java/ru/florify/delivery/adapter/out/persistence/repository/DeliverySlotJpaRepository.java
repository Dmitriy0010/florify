package ru.florify.delivery.adapter.out.persistence.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import ru.florify.delivery.adapter.out.persistence.entity.DeliverySlotJpaEntity;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

public interface DeliverySlotJpaRepository extends JpaRepository<DeliverySlotJpaEntity, UUID> {

    List<DeliverySlotJpaEntity> findAllByDate(LocalDate date);

    boolean existsByDateAndStartTimeAndEndTime(LocalDate date, LocalTime startTime, LocalTime endTime);
}
