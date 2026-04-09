package ru.florify.common.exception;

/**
 * Thrown when the authenticated user lacks permission to perform an action.
 * Maps to HTTP 403.
 */
public class ForbiddenException extends DomainException {

    public ForbiddenException() {
        super("FORBIDDEN", "Access denied");
    }

    public ForbiddenException(String reason) {
        super("FORBIDDEN", reason);
    }
}
