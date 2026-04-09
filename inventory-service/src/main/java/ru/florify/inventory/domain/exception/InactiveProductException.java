package ru.florify.inventory.domain.exception;

public class InactiveProductException extends RuntimeException {
    public InactiveProductException(String message) {
        super(message);
    }
}
