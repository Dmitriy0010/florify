package ru.florify.order.domain.exception;

import ru.florify.common.exception.DomainException;

public class InvalidOrderStatusTransitionException extends DomainException {
    public InvalidOrderStatusTransitionException(String message) {
        super("INVALID_ORDER_STATUS_TRANSITION", message);
    }
}
