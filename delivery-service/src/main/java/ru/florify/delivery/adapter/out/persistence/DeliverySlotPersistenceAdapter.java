package ru.florify.delivery.adapter.out.persistence;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import ru.florify.delivery.adapter.out.persistence.mapper.DeliverySlotPersistenceMapper;
import ru.florify.delivery.adapter.out.persistence.repository.DeliverySlotJpaRepository;
import ru.florify.delivery.application.port.out.DeliverySlotRepository;
import ru.florify.delivery.domain.model.DeliverySlot;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Адаптер исходящего порта DeliverySlotRepository.
 */
@Component
@RequiredArgsConstructor
public class DeliverySlotPersistenceAdapter implements DeliverySlotRepository {

    private final DeliverySlotJpaRepository jpaRepository;
    private final DeliverySlotPersistenceMapper mapper;

    @Override
    public DeliverySlot save(DeliverySlot slot) {
        return mapper.toDomain(jpaRepository.save(mapper.toEntity(slot)));
    }

    @Override
    public Optional<DeliverySlot> findById(UUID id) {
        return jpaRepository.findById(id).map(mapper::toDomain);
    }

    @Override
    public List<DeliverySlot> findByDate(LocalDate date) {
        return jpaRepository.findAllByDate(date).stream()
                .map(mapper::toDomain)
                .toList();
    }

    @Override
    public boolean existsByDateAndTime(LocalDate date, LocalTime startTime, LocalTime endTime) {
        return jpaRepository.existsByDateAndStartTimeAndEndTime(date, startTime, endTime);
    }

    @Override
    public void deleteById(UUID id) {
        jpaRepository.deleteById(id);
    }
}
