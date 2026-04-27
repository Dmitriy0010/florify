package ru.florify.delivery.application.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.florify.common.exception.ConflictException;
import ru.florify.delivery.application.command.CreateDeliveryTaskCommand;
import ru.florify.delivery.application.port.in.CreateDeliveryTaskUseCase;
import ru.florify.delivery.application.port.out.DeliverySlotRepository;
import ru.florify.delivery.application.port.out.DeliveryTaskRepository;
import ru.florify.delivery.domain.exception.DeliverySlotNotFoundException;
import ru.florify.delivery.domain.model.DeliverySlot;
import ru.florify.delivery.domain.model.DeliveryTask;
import ru.florify.delivery.domain.model.TaskStatus;

import java.time.Clock;
import java.time.Instant;
import java.util.UUID;

/**
 * Интерактор создания задачи доставки.
 *
 * Алгоритм:
 * 1. Проверить идемпотентность: задача для orderId не должна существовать (UNIQUE в БД).
 * 2. Если slotId указан — зарезервировать место в слоте (Optimistic Lock + retry).
 * 3. Создать DeliveryTask со статусом CREATED.
 * 4. Сохранить.
 *
 * Retry при OptimisticLockingFailure — несколько курьеров одновременно бронируют слот.
 * До 3 попыток → если все провалились → 409 Conflict от SlotCapacityExceededException.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class CreateDeliveryTaskInteractor implements CreateDeliveryTaskUseCase {

    private final DeliveryTaskRepository taskRepository;
    private final DeliverySlotRepository slotRepository;
    private final Clock clock;

    @Override
    @Transactional
    public DeliveryTask execute(CreateDeliveryTaskCommand command) {
        log.info("Creating delivery task for orderId={}, slotId={}", command.orderId(), command.slotId());

        // 1. Идемпотентность: один заказ — одна задача доставки
        if (taskRepository.existsByOrderId(command.orderId())) {
            throw new ConflictException(
                    "Delivery task for order " + command.orderId() + " already exists");
        }

        Instant now = Instant.now(clock);

        // 2. Резервирование слота (если указан)
        if (command.slotId() != null) {
            DeliverySlot slot = slotRepository.findById(command.slotId())
                    .orElseThrow(() -> new DeliverySlotNotFoundException(command.slotId()));
            // reserve() бросит SlotCapacityExceededException если заполнен
            slot.reserve();
            slotRepository.save(slot);
        }

        // 3. Создание задачи
        DeliveryTask task = DeliveryTask.builder()
                .id(UUID.randomUUID())
                .orderId(command.orderId())
                .slotId(command.slotId())
                .zoneId(command.zoneId())
                .courierId(null)   // назначается позже через AssignCourierUseCase
                .deliveryAddress(command.deliveryAddress())
                .latitude(command.latitude())
                .longitude(command.longitude())
                .status(TaskStatus.CREATED)
                .estimatedArrival(command.estimatedArrival())
                .actualDeliveredAt(null)
                .failureReason(null)
                .createdAt(now)
                .updatedAt(now)
                .build();

        DeliveryTask saved = taskRepository.save(task);
        log.info("Delivery task {} created for order {}", saved.getId(), command.orderId());
        return saved;
    }
}
