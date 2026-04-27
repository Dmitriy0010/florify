package ru.florify.delivery.application;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import ru.florify.common.exception.ConflictException;
import ru.florify.delivery.application.command.CreateDeliveryTaskCommand;
import ru.florify.delivery.application.port.out.DeliverySlotRepository;
import ru.florify.delivery.application.port.out.DeliveryTaskRepository;
import ru.florify.delivery.application.service.CreateDeliveryTaskInteractor;
import ru.florify.delivery.domain.exception.SlotCapacityExceededException;
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
class CreateDeliveryTaskInteractorTest {

    @Mock
    private DeliveryTaskRepository taskRepository;

    @Mock
    private DeliverySlotRepository slotRepository;

    @InjectMocks
    private CreateDeliveryTaskInteractor interactor;

    private final Instant now = Instant.parse("2026-04-17T10:00:00Z");
    private final Clock clock = Clock.fixed(now, ZoneOffset.UTC);

    @BeforeEach
    void setUp() {
        interactor = new CreateDeliveryTaskInteractor(taskRepository, slotRepository, clock);
    }

    private CreateDeliveryTaskCommand commandWithSlot(UUID orderId, UUID slotId) {
        return new CreateDeliveryTaskCommand(orderId, slotId, null, "ул. Ленина, 1",
                null, null, null, UUID.randomUUID());
    }

    private CreateDeliveryTaskCommand commandWithoutSlot(UUID orderId) {
        return new CreateDeliveryTaskCommand(orderId, null, null, "ул. Ленина, 1",
                null, null, null, UUID.randomUUID());
    }

    private DeliverySlot availableSlot(UUID slotId) {
        return DeliverySlot.builder()
                .id(slotId)
                .date(LocalDate.now())
                .startTime(LocalTime.of(10, 0))
                .endTime(LocalTime.of(12, 0))
                .maxCapacity(5)
                .currentLoad(0)
                .version(0)
                .build();
    }

    @Test
    void execute_withFreeSlot_createsTaskAndReservesSlot() {
        UUID orderId = UUID.randomUUID();
        UUID slotId = UUID.randomUUID();
        DeliverySlot slot = availableSlot(slotId);

        when(taskRepository.existsByOrderId(orderId)).thenReturn(false);
        when(slotRepository.findById(slotId)).thenReturn(Optional.of(slot));
        when(slotRepository.save(any())).thenReturn(slot);
        when(taskRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        DeliveryTask result = interactor.execute(commandWithSlot(orderId, slotId));

        assertThat(result.getStatus()).isEqualTo(TaskStatus.CREATED);
        assertThat(result.getOrderId()).isEqualTo(orderId);
        assertThat(result.getSlotId()).isEqualTo(slotId);
        assertThat(slot.getCurrentLoad()).isEqualTo(1); // slot was reserved
        verify(slotRepository).save(slot);
        verify(taskRepository).save(any());
    }

    @Test
    void execute_withFullSlot_throwsSlotCapacityExceeded() {
        UUID orderId = UUID.randomUUID();
        UUID slotId = UUID.randomUUID();
        DeliverySlot fullSlot = DeliverySlot.builder()
                .id(slotId)
                .maxCapacity(1)
                .currentLoad(1)  // полный
                .version(0)
                .build();

        when(taskRepository.existsByOrderId(orderId)).thenReturn(false);
        when(slotRepository.findById(slotId)).thenReturn(Optional.of(fullSlot));

        assertThatThrownBy(() -> interactor.execute(commandWithSlot(orderId, slotId)))
                .isInstanceOf(SlotCapacityExceededException.class);

        verify(taskRepository, never()).save(any());
    }

    @Test
    void execute_duplicateOrder_throwsConflictException() {
        UUID orderId = UUID.randomUUID();

        when(taskRepository.existsByOrderId(orderId)).thenReturn(true);

        assertThatThrownBy(() -> interactor.execute(commandWithoutSlot(orderId)))
                .isInstanceOf(ConflictException.class)
                .hasMessageContaining(orderId.toString());

        verify(taskRepository, never()).save(any());
        verify(slotRepository, never()).findById(any());
    }

    @Test
    void execute_withoutSlot_createsTaskWithoutSlotReservation() {
        UUID orderId = UUID.randomUUID();

        when(taskRepository.existsByOrderId(orderId)).thenReturn(false);
        when(taskRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        DeliveryTask result = interactor.execute(commandWithoutSlot(orderId));

        assertThat(result.getStatus()).isEqualTo(TaskStatus.CREATED);
        assertThat(result.getSlotId()).isNull();
        verify(slotRepository, never()).findById(any());
    }
}
