package ru.florify.delivery.application.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.florify.delivery.application.command.AssignCourierCommand;
import ru.florify.delivery.application.port.in.AssignCourierUseCase;
import ru.florify.delivery.application.port.out.DeliveryTaskRepository;
import ru.florify.common.event.DeliveryTaskStatusChangedEvent;
import ru.florify.delivery.domain.exception.DeliveryTaskNotFoundException;
import ru.florify.delivery.domain.model.DeliveryTask;
import ru.florify.delivery.domain.model.TaskStatus;

import java.time.Clock;
import java.time.Instant;

/**
 * Интерактор назначения курьера на задачу доставки.
 *
 * Алгоритм:
 * 1. Загрузить задачу.
 * 2. Вызвать доменный метод assignCourier() — он проверяет допустимость по FSM.
 * 3. Сохранить.
 * 4. Опубликовать DeliveryTaskStatusChangedEvent через Spring Events.
 *
 * Переназначение курьера допустимо (ASSIGNED → ASSIGNED).
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AssignCourierInteractor implements AssignCourierUseCase {

    private final DeliveryTaskRepository taskRepository;
    private final ApplicationEventPublisher eventPublisher;
    private final Clock clock;

    @Override
    @Transactional
    public DeliveryTask execute(AssignCourierCommand command) {
        log.info("Assigning courier {} to task {}", command.courierId(), command.taskId());

        DeliveryTask task = taskRepository.findById(command.taskId())
                .orElseThrow(() -> new DeliveryTaskNotFoundException(command.taskId()));

        TaskStatus previousStatus = task.getStatus();
        Instant now = Instant.now(clock);

        // Доменная логика — проверка FSM и применение перехода
        DeliveryTask updated = task.assignCourier(command.courierId(), now);
        DeliveryTask saved = taskRepository.save(updated);

        // Уведомляем остальные домены через Spring ApplicationEvents
        eventPublisher.publishEvent(
                DeliveryTaskStatusChangedEvent.of(
                        saved.getId(),
                        saved.getOrderId(),
                        saved.getCourierId(),
                        previousStatus.name(),
                        saved.getStatus().name(),
                        null,
                        now
                )
        );

        log.info("Courier {} assigned to task {}, status: {} → {}",
                command.courierId(), command.taskId(), previousStatus, saved.getStatus());
        return saved;
    }
}
