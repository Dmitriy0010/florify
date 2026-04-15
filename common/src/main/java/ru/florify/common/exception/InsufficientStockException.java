package ru.florify.common.exception;

public class InsufficientStockException extends DomainException {
    public InsufficientStockException(String message) {
        super("INSUFFICIENT_STOCK", message);
    }
}
