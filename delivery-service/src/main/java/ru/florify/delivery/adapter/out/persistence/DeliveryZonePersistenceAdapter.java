package ru.florify.delivery.adapter.out.persistence;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import ru.florify.delivery.adapter.out.persistence.mapper.DeliveryZonePersistenceMapper;
import ru.florify.delivery.adapter.out.persistence.repository.DeliveryZoneJpaRepository;
import ru.florify.delivery.application.port.out.DeliveryZoneRepository;
import ru.florify.delivery.domain.model.DeliveryZone;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Адаптер исходящего порта DeliveryZoneRepository.
 * Берёт на себя «грязную работу»: обращение к JPA, маппинг entity ↔ domain.
 * Application-слой остаётся чистым от инфраструктурных деталей.
 */
@Component
@RequiredArgsConstructor
public class DeliveryZonePersistenceAdapter implements DeliveryZoneRepository {

    private final DeliveryZoneJpaRepository jpaRepository;
    private final DeliveryZonePersistenceMapper mapper;

    @Override
    public DeliveryZone save(DeliveryZone zone) {
        return mapper.toDomain(jpaRepository.save(mapper.toEntity(zone)));
    }

    @Override
    public Optional<DeliveryZone> findById(UUID id) {
        return jpaRepository.findById(id).map(mapper::toDomain);
    }

    @Override
    public List<DeliveryZone> findAllActive() {
        return jpaRepository.findAllByActiveTrue().stream()
                .map(mapper::toDomain)
                .toList();
    }

    @Override
    public boolean existsByName(String name) {
        return jpaRepository.existsByNameIgnoreCase(name);
    }
}
