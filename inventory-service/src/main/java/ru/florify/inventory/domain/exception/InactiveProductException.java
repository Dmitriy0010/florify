package ru.florify.inventory.domain.exception;

import ru.florify.common.exception.DomainException;

public class InactiveProductException extends DomainException {
    public InactiveProductException(String message) {
        super("PRODUCT_INACTIVE", message);
    }
}
