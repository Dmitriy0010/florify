package ru.florify.order.domain.exception;

import ru.florify.common.exception.NotFoundException;

import java.util.UUID;

public class OrderNotFoundException extends NotFoundException {
    public OrderNotFoundException(UUID orderId) {
        super("Order", orderId);
    }

    public OrderNotFoundException(String orderNumber) {
        super("Order", orderNumber);
    }
}
