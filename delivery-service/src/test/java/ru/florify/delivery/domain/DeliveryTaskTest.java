package ru.florify.delivery.domain;

import org.junit.jupiter.api.Test;
import ru.florify.delivery.domain.exception.InvalidTaskStatusTransitionException;
import ru.florify.delivery.domain.model.DeliveryTask;
import ru.florify.delivery.domain.model.TaskStatus;

import java.time.Instant;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class DeliveryTaskTest {

    private static final Instant NOW = Instant.parse("2026-04-17T10:00:00Z");

    private DeliveryTask newCreatedTask() {
        return DeliveryTask.builder()
                .id(UUID.randomUUID())
                .orderId(UUID.randomUUID())
                .deliveryAddress("ул. Ленина, 1")
                .status(TaskStatus.CREATED)
                .createdAt(NOW)
                .updatedAt(NOW)
                
                .build();
    }

    // ─── assignCourier ────────────────────────────────────────────────────────

    @Test
    void assignCourier_fromCreated_setsAssignedStatus() {
        DeliveryTask task = newCreatedTask();
        UUID courierId = UUID.randomUUID();

        DeliveryTask result = task.assignCourier(courierId, NOW);

        assertThat(result.getStatus()).isEqualTo(TaskStatus.ASSIGNED);
        assertThat(result.getCourierId()).isEqualTo(courierId);
        assertThat(result.getUpdatedAt()).isEqualTo(NOW);
    }

    @Test
    void assignCourier_fromAssigned_allowsReassignment() {
        UUID firstCourier = UUID.randomUUID();
        UUID secondCourier = UUID.randomUUID();
        DeliveryTask task = newCreatedTask().assignCourier(firstCourier, NOW);

        DeliveryTask result = task.assignCourier(secondCourier, NOW);

        assertThat(result.getStatus()).isEqualTo(TaskStatus.ASSIGNED);
        assertThat(result.getCourierId()).isEqualTo(secondCourier);
    }

    @Test
    void assignCourier_fromPickedUp_throwsException() {
        DeliveryTask task = newCreatedTask()
                .assignCourier(UUID.randomUUID(), NOW)
                .pickUp(NOW);

        assertThatThrownBy(() -> task.assignCourier(UUID.randomUUID(), NOW))
                .isInstanceOf(InvalidTaskStatusTransitionException.class)
                .hasMessageContaining("PICKED_UP")
                .hasMessageContaining("ASSIGNED");
    }

    // ─── pickUp ───────────────────────────────────────────────────────────────

    @Test
    void pickUp_fromAssigned_setsPickedUpStatus() {
        DeliveryTask task = newCreatedTask().assignCourier(UUID.randomUUID(), NOW);

        DeliveryTask result = task.pickUp(NOW);

        assertThat(result.getStatus()).isEqualTo(TaskStatus.PICKED_UP);
    }

    @Test
    void pickUp_fromCreated_throwsException() {
        DeliveryTask task = newCreatedTask();

        assertThatThrownBy(() -> task.pickUp(NOW))
                .isInstanceOf(InvalidTaskStatusTransitionException.class);
    }

    // ─── deliver ──────────────────────────────────────────────────────────────

    @Test
    void deliver_fromPickedUp_setsDeliveredWithTimestamp() {
        DeliveryTask task = newCreatedTask()
                .assignCourier(UUID.randomUUID(), NOW)
                .pickUp(NOW);

        DeliveryTask result = task.deliver(NOW);

        assertThat(result.getStatus()).isEqualTo(TaskStatus.DELIVERED);
        assertThat(result.getActualDeliveredAt()).isEqualTo(NOW);
    }

    @Test
    void deliver_fromAssigned_throwsException() {
        DeliveryTask task = newCreatedTask().assignCourier(UUID.randomUUID(), NOW);

        assertThatThrownBy(() -> task.deliver(NOW))
                .isInstanceOf(InvalidTaskStatusTransitionException.class);
    }

    // ─── fail ─────────────────────────────────────────────────────────────────

    @Test
    void fail_fromCreated_setsFailedWithReason() {
        DeliveryTask task = newCreatedTask();

        DeliveryTask result = task.fail("Customer not found", NOW);

        assertThat(result.getStatus()).isEqualTo(TaskStatus.FAILED);
        assertThat(result.getFailureReason()).isEqualTo("Customer not found");
    }

    @Test
    void fail_fromDelivered_throwsException() {
        DeliveryTask task = newCreatedTask()
                .assignCourier(UUID.randomUUID(), NOW)
                .pickUp(NOW)
                .deliver(NOW);

        assertThatThrownBy(() -> task.fail("oops", NOW))
                .isInstanceOf(InvalidTaskStatusTransitionException.class);
    }

    @Test
    void failed_isFinal() {
        assertThat(TaskStatus.FAILED.isFinal()).isTrue();
    }

    @Test
    void delivered_isFinal() {
        assertThat(TaskStatus.DELIVERED.isFinal()).isTrue();
    }

    @Test
    void created_isNotFinal() {
        assertThat(TaskStatus.CREATED.isFinal()).isFalse();
    }
}
