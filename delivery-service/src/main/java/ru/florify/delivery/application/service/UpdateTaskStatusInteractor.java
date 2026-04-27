package ru.florify.delivery.application.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.florify.delivery.application.command.UpdateTaskStatusCommand;
import ru.florify.delivery.application.port.in.UpdateTaskStatusUseCase;
import ru.florify.delivery.application.port.out.DeliverySlotRepository;
import ru.florify.delivery.application.port.out.DeliveryTaskRepository;
import ru.florify.common.event.DeliveryTaskStatusChangedEvent;
import ru.florify.delivery.domain.exception.DeliveryTaskNotFoundException;
import ru.florify.delivery.domain.model.DeliverySlot;
import ru.florify.delivery.domain.model.DeliveryTask;
import ru.florify.delivery.domain.model.TaskStatus;

import java.time.Clock;
import java.time.Instant;

/**
 * Интерактор обновления статуса задачи доставки.
 *
 * Алгоритм:
 * 1. Загрузить задачу.
 * 2. Делегировать доменному методу (pickUp / deliver / fail) — FSM проверяется там.
 * 3. При DELIVERED/FAILED — освободить слот (если был привязан).
 * 4. Сохранить задачу.
 * 5. Опубликовать DeliveryTaskStatusChangedEvent через Spring Events.
 *
 * Публикация события позволяет order-service и notification-service реагировать
 * на изменение статуса доставки без прямых зависимостей.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class UpdateTaskStatusInteractor implements UpdateTaskStatusUseCase {

    private final DeliveryTaskRepository taskRepository;
    private final DeliverySlotRepository slotRepository;
    private final ApplicationEventPublisher eventPublisher;
    private final Clock clock;

    @Override
    @Transactional
    public DeliveryTask execute(UpdateTaskStatusCommand command) {
        log.info("Updating task {} status to {}", command.taskId(), command.newStatus());

        DeliveryTask task = taskRepository.findById(command.taskId())
                .orElseThrow(() -> new DeliveryTaskNotFoundException(command.taskId()));

        TaskStatus previousStatus = task.getStatus();
        Instant now = Instant.now(clock);

        // 2. Делегируем переход доменному методу (который проверяет FSM)
        DeliveryTask updated = applyTransition(task, command, now);

        // 3. При финальном статусе — освобождаем слот
        if (updated.getStatus().isFinal() && updated.getSlotId() != null) {
            slotRepository.findById(updated.getSlotId()).ifPresent(slot -> {
                slot.release();
                slotRepository.save(slot);
                log.debug("Slot {} released for finished task {}", updated.getSlotId(), updated.getId());
            });
        }

        // 4. Сохраняем задачу
        DeliveryTask saved = taskRepository.save(updated);

        // 5. Публикуем Spring Event для order-service и notification-service
        eventPublisher.publishEvent(
                DeliveryTaskStatusChangedEvent.of(
                        saved.getId(),
                        saved.getOrderId(),
                        saved.getCourierId(),
                        previousStatus.name(),
                        saved.getStatus().name(),
                        saved.getFailureReason(),
                        now
                )
        );

        log.info("Task {} status updated: {} → {}", saved.getId(), previousStatus, saved.getStatus());
        return saved;
    }

    /**
     * Маршрутизация к соответствующему доменному методу на основе целевого статуса.
     * InvalidTaskStatusTransitionException будет брошен внутри доменного метода,
     * если переход недопустим по FSM.
     */
    private DeliveryTask applyTransition(DeliveryTask task, UpdateTaskStatusCommand command, Instant now) {
        return switch (command.newStatus()) {
            case PICKED_UP -> task.pickUp(now);
            case DELIVERED -> task.deliver(now);
            case FAILED    -> task.fail(command.failureReason(), now);
            default -> throw new ru.florify.common.exception.DomainException(
                    "INVALID_TRANSITION", "Use AssignCourierUseCase to transition to ASSIGNED status");
        };
    }
}
