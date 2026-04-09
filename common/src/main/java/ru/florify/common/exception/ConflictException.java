package ru.florify.common.exception;

/**
 * Thrown when an operation would create a conflict with existing data
 * (e.g. registering a user with an already-taken email).
 * Maps to HTTP 409.
 */
public class ConflictException extends DomainException {

    public ConflictException(String message) {
        super("CONFLICT", message);
    }
}
