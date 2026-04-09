package ru.florify.common.exception;

/**
 * Thrown when a token exists but its expiry instant is in the past.
 * Maps to HTTP 401 via GlobalExceptionHandler.
 *
 * Declared in common so GlobalExceptionHandler can reference it
 * without a dependency on auth-service.
 */
public class TokenExpiredException extends DomainException {

    public TokenExpiredException() {
        super("TOKEN_EXPIRED", "Token has expired");
    }
}
