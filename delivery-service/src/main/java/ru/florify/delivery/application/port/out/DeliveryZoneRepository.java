package ru.florify.delivery.application.port.out;

import ru.florify.delivery.domain.model.DeliveryZone;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Выходной порт (SPI) для работы с зонами доставки.
 *
 * Правило манифеста: нет Pageable, нет Page<T>, нет JPA-импортов.
 * Реализуется в DeliveryZonePersistenceAdapter (adapter/out).
 */
public interface DeliveryZoneRepository {

    DeliveryZone save(DeliveryZone zone);

    Optional<DeliveryZone> findById(UUID id);

    List<DeliveryZone> findAllActive();

    boolean existsByName(String name);
}
