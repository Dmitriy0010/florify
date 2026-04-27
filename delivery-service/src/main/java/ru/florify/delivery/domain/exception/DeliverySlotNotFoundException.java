package ru.florify.delivery.domain.exception;

import ru.florify.common.exception.NotFoundException;

import java.util.UUID;

/**
 * Бросается когда временной слот доставки не найден по ID.
 * GlobalExceptionHandler маппит NotFoundException → 404 Not Found.
 */
public class DeliverySlotNotFoundException extends NotFoundException {
    public DeliverySlotNotFoundException(UUID id) {
        super("DeliverySlot", id);
    }
}
