package ru.florify.delivery.application;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;
import ru.florify.delivery.application.command.UpdateTaskStatusCommand;
import ru.florify.delivery.application.port.out.DeliverySlotRepository;
import ru.florify.delivery.application.port.out.DeliveryTaskRepository;
import ru.florify.delivery.application.service.UpdateTaskStatusInteractor;
import ru.florify.common.event.DeliveryTaskStatusChangedEvent;
import ru.florify.delivery.domain.exception.InvalidTaskStatusTransitionException;
import ru.florify.delivery.domain.model.DeliverySlot;
import ru.florify.delivery.domain.model.DeliveryTask;
import ru.florify.delivery.domain.model.TaskStatus;

import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZoneOffset;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UpdateTaskStatusInteractorTest {

    @Mock private DeliveryTaskRepository taskRepository;
    @Mock private DeliverySlotRepository slotRepository;
    @Mock private ApplicationEventPublisher eventPublisher;

    private UpdateTaskStatusInteractor interactor;

    private final Instant now = Instant.parse("2026-04-17T10:00:00Z");
    private final Clock clock = Clock.fixed(now, ZoneOffset.UTC);

    @BeforeEach
    void setUp() {
        interactor = new UpdateTaskStatusInteractor(taskRepository, slotRepository, eventPublisher, clock);
    }

    private DeliveryTask taskWithStatus(TaskStatus status) {
        return DeliveryTask.builder()
                .id(UUID.randomUUID())
                .orderId(UUID.randomUUID())
                .courierId(UUID.randomUUID())
                .slotId(UUID.randomUUID())
                .deliveryAddress("ул. Ленина, 1")
                .status(status)
                .createdAt(now)
                .updatedAt(now)
                .version(0)
                .build();
    }

    @Test
    void execute_pickUp_updatesStatusAndPublishesEvent() {
        DeliveryTask task = taskWithStatus(TaskStatus.ASSIGNED);
        when(taskRepository.findById(task.getId())).thenReturn(Optional.of(task));
        when(taskRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        UpdateTaskStatusCommand command = new UpdateTaskStatusCommand(
                task.getId(), TaskStatus.PICKED_UP, null, UUID.randomUUID());
        DeliveryTask result = interactor.execute(command);

        assertThat(result.getStatus()).isEqualTo(TaskStatus.PICKED_UP);

        ArgumentCaptor<DeliveryTaskStatusChangedEvent> eventCaptor =
                ArgumentCaptor.forClass(DeliveryTaskStatusChangedEvent.class);
        verify(eventPublisher).publishEvent(eventCaptor.capture());

        DeliveryTaskStatusChangedEvent event = eventCaptor.getValue();
        assertThat(event.previousStatus()).isEqualTo(TaskStatus.ASSIGNED.name());
        assertThat(event.newStatus()).isEqualTo(TaskStatus.PICKED_UP.name());
    }

    @Test
    void execute_deliver_releasesSlot() {
        UUID slotId = UUID.randomUUID();
        DeliveryTask task = taskWithStatus(TaskStatus.PICKED_UP).toBuilder().slotId(slotId).build();
        DeliverySlot slot = DeliverySlot.builder()
                .id(slotId)
                .maxCapacity(5)
                .currentLoad(1)
                .version(0)
                .build();

        when(taskRepository.findById(task.getId())).thenReturn(Optional.of(task));
        when(taskRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(slotRepository.findById(slotId)).thenReturn(Optional.of(slot));
        when(slotRepository.save(any())).thenReturn(slot);

        UpdateTaskStatusCommand command = new UpdateTaskStatusCommand(
                task.getId(), TaskStatus.DELIVERED, null, UUID.randomUUID());
        interactor.execute(command);

        assertThat(slot.getCurrentLoad()).isEqualTo(0); // slot released
        verify(slotRepository).save(slot);
        verify(eventPublisher).publishEvent(any(DeliveryTaskStatusChangedEvent.class));
    }

    @Test
    void execute_invalidTransition_throwsExceptionAndNoEventPublished() {
        DeliveryTask task = taskWithStatus(TaskStatus.DELIVERED); // финальный статус
        when(taskRepository.findById(task.getId())).thenReturn(Optional.of(task));

        UpdateTaskStatusCommand command = new UpdateTaskStatusCommand(
                task.getId(), TaskStatus.PICKED_UP, null, UUID.randomUUID());

        assertThatThrownBy(() -> interactor.execute(command))
                .isInstanceOf(InvalidTaskStatusTransitionException.class);

        verify(eventPublisher, never()).publishEvent(any());
    }

    @Test
    void execute_fail_setsReasonAndPublishesEvent() {
        DeliveryTask task = taskWithStatus(TaskStatus.ASSIGNED);
        when(taskRepository.findById(task.getId())).thenReturn(Optional.of(task));
        when(slotRepository.findById(any())).thenReturn(Optional.empty());
        when(taskRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        UpdateTaskStatusCommand command = new UpdateTaskStatusCommand(
                task.getId(), TaskStatus.FAILED, "No one at home", UUID.randomUUID());

        DeliveryTask result = interactor.execute(command);

        assertThat(result.getStatus()).isEqualTo(TaskStatus.FAILED);
        assertThat(result.getFailureReason()).isEqualTo("No one at home");
        verify(eventPublisher).publishEvent(any(DeliveryTaskStatusChangedEvent.class));
    }
}
