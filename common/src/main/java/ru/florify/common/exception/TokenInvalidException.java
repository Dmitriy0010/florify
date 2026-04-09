package ru.florify.common.exception;

/**
 * Thrown when a token cannot be found in storage or has been explicitly revoked.
 * Maps to HTTP 401 via GlobalExceptionHandler.
 */
public class TokenInvalidException extends DomainException {

    public TokenInvalidException() {
        super("TOKEN_INVALID", "Token is invalid or has been revoked");
    }
}
