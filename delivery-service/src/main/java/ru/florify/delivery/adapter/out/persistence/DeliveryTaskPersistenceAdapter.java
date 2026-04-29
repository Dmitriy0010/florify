package ru.florify.delivery.adapter.out.persistence;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import ru.florify.delivery.adapter.out.persistence.mapper.DeliveryTaskPersistenceMapper;
import ru.florify.delivery.adapter.out.persistence.repository.DeliveryTaskJpaRepository;
import ru.florify.delivery.application.port.out.DeliveryTaskRepository;
import ru.florify.delivery.domain.model.DeliveryTask;
import ru.florify.delivery.domain.model.TaskStatus;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Адаптер исходящего порта DeliveryTaskRepository.
 */
@Component
@RequiredArgsConstructor
public class DeliveryTaskPersistenceAdapter implements DeliveryTaskRepository {

    private final DeliveryTaskJpaRepository jpaRepository;
    private final DeliveryTaskPersistenceMapper mapper;

    @Override
    public DeliveryTask save(DeliveryTask task) {
        return mapper.toDomain(jpaRepository.save(mapper.toEntity(task)));
    }

    @Override
    public Optional<DeliveryTask> findById(UUID id) {
        return jpaRepository.findById(id).map(mapper::toDomain);
    }

    @Override
    public Optional<DeliveryTask> findByOrderId(UUID orderId) {
        return jpaRepository.findByOrderId(orderId).map(mapper::toDomain);
    }

    @Override
    public List<DeliveryTask> findByCourierId(UUID courierId) {
        return jpaRepository.findAllByCourierId(courierId).stream()
                .map(mapper::toDomain)
                .toList();
    }

    @Override
    public List<DeliveryTask> findByCourierIdSorted(UUID courierId) {
        return jpaRepository.findAllByCourierIdOrderByEstimatedArrivalAsc(courierId).stream()
                .map(mapper::toDomain)
                .toList();
    }

    @Override
    public List<DeliveryTask> findFreeTasks() {
        return jpaRepository.findByStatusAndCourierIdIsNullOrderByEstimatedArrivalAsc(TaskStatus.CREATED).stream()
                .map(mapper::toDomain)
                .toList();
    }

    @Override
    public List<DeliveryTask> findByStatusAndDate(TaskStatus status, LocalDate date) {
        return jpaRepository.findByStatusAndSlotDate(status, date).stream()
                .map(mapper::toDomain)
                .toList();
    }

    @Override
    public void deleteByOrderId(UUID orderId) {
        jpaRepository.deleteByOrderId(orderId);
    }

    @Override
    public boolean existsByOrderId(UUID orderId) {
        return jpaRepository.existsByOrderId(orderId);
    }
}
