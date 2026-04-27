package ru.florify.delivery.domain.exception;

import ru.florify.common.exception.DomainException;
import ru.florify.delivery.domain.model.TaskStatus;

/**
 * Бросается при попытке выполнить недопустимый переход статуса задачи доставки.
 * GlobalExceptionHandler маппит DomainException → 422 Unprocessable Entity.
 */
public class InvalidTaskStatusTransitionException extends DomainException {
    public InvalidTaskStatusTransitionException(TaskStatus current, TaskStatus target) {
        super("INVALID_TRANSITION", "Cannot transition delivery task from " + current + " to " + target);
    }
}
