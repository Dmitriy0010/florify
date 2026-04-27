package ru.florify.delivery.domain.exception;

import ru.florify.common.exception.NotFoundException;

import java.util.UUID;

/**
 * Бросается когда задача доставки не найдена по ID.
 * GlobalExceptionHandler маппит NotFoundException → 404 Not Found.
 */
public class DeliveryTaskNotFoundException extends NotFoundException {
    public DeliveryTaskNotFoundException(UUID id) {
        super("DeliveryTask", id);
    }
}
