package ru.florify.delivery.domain.exception;

import ru.florify.common.exception.DomainException;

import java.util.UUID;

/**
 * Бросается из DeliverySlot.reserve() при попытке перегрузить слот сверх maxCapacity.
 * GlobalExceptionHandler маппит DomainException → 422 Unprocessable Entity.
 */
public class SlotCapacityExceededException extends DomainException {
    public SlotCapacityExceededException(UUID slotId, int maxCapacity) {
        super("CAPACITY_EXCEEDED", "Delivery slot " + slotId + " is fully booked (capacity: " + maxCapacity + ")");
    }
}
