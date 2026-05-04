package ru.florify.delivery.domain;

import org.junit.jupiter.api.Test;
import ru.florify.delivery.domain.exception.SlotCapacityExceededException;
import ru.florify.delivery.domain.model.DeliverySlot;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class DeliverySlotTest {

    private DeliverySlot newSlot(int maxCapacity) {
        return DeliverySlot.builder()
                .id(UUID.randomUUID())
                .date(LocalDate.of(2026, 4, 20))
                .startTime(LocalTime.of(10, 0))
                .endTime(LocalTime.of(12, 0))
                .maxCapacity(maxCapacity)
                .currentLoad(0)
                
                .build();
    }

    @Test
    void reserve_withinCapacity_incrementsLoad() {
        DeliverySlot slot = newSlot(3);

        slot.reserve();

        assertThat(slot.getCurrentLoad()).isEqualTo(1);
    }

    @Test
    void reserve_toMaxCapacity_succeeds() {
        DeliverySlot slot = newSlot(2);

        slot.reserve();
        slot.reserve();

        assertThat(slot.getCurrentLoad()).isEqualTo(2);
        assertThat(slot.isFull()).isTrue();
    }

    @Test
    void reserve_overCapacity_throwsException() {
        DeliverySlot slot = newSlot(1);
        slot.reserve(); // теперь slot заполнен

        assertThatThrownBy(slot::reserve)
                .isInstanceOf(SlotCapacityExceededException.class)
                .hasMessageContaining("fully booked");
    }

    @Test
    void release_decrementsLoad() {
        DeliverySlot slot = newSlot(3);
        slot.reserve();
        slot.reserve();

        slot.release();

        assertThat(slot.getCurrentLoad()).isEqualTo(1);
    }

    @Test
    void release_onEmptySlot_doesNotGoNegative() {
        DeliverySlot slot = newSlot(3);

        slot.release(); // при 0 — ничего не делаем

        assertThat(slot.getCurrentLoad()).isEqualTo(0);
    }

    @Test
    void isFull_whenAtMaxCapacity_returnsTrue() {
        DeliverySlot slot = newSlot(1);
        slot.reserve();

        assertThat(slot.isFull()).isTrue();
    }

    @Test
    void isFull_whenBelowMaxCapacity_returnsFalse() {
        DeliverySlot slot = newSlot(3);
        slot.reserve();

        assertThat(slot.isFull()).isFalse();
    }
}
