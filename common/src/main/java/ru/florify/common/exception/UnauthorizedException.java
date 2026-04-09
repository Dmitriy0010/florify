package ru.florify.common.exception;

/**
 * Thrown when the caller is not authenticated.
 * Maps to HTTP 401.
 */
public class UnauthorizedException extends DomainException {

    public UnauthorizedException() {
        super("UNAUTHORIZED", "Authentication required");
    }
}
