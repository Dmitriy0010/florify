package ru.florify.delivery.application.port.out;

import ru.florify.delivery.domain.model.DeliverySlot;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Выходной порт (SPI) для работы со слотами доставки.
 *
 * Правило манифеста: нет Pageable, нет Page<T>, нет JPA-импортов.
 * Реализуется в DeliverySlotPersistenceAdapter (adapter/out).
 */
public interface DeliverySlotRepository {

    DeliverySlot save(DeliverySlot slot);

    Optional<DeliverySlot> findById(UUID id);

    List<DeliverySlot> findByDate(LocalDate date);

    boolean existsByDateAndTime(LocalDate date, LocalTime startTime, LocalTime endTime);

    void deleteById(UUID id);
}
