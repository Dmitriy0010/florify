package ru.florify.delivery.domain.exception;

import ru.florify.common.exception.NotFoundException;

import java.util.UUID;

/**
 * Бросается когда зона доставки не найдена по ID.
 * GlobalExceptionHandler маппит NotFoundException → 404 Not Found.
 */
public class DeliveryZoneNotFoundException extends NotFoundException {
    public DeliveryZoneNotFoundException(UUID id) {
        super("DeliveryZone", id);
    }
}
