package ru.florify.common.exception;

import lombok.Getter;

/**
 * Base class for all business-domain exceptions in Florify.
 * <p>
 * Every domain error carries a machine-readable {@code errorCode}
 * (e.g. "USER_NOT_FOUND") that is returned to the client inside
 * {@link ru.florify.common.web.ErrorResponse}.
 * <p>
 * This is an unchecked exception: callers are NOT forced to catch it —
 * {@link ru.florify.common.web.GlobalExceptionHandler} handles it centrally.
 *
 * @see ru.florify.common.web.GlobalExceptionHandler
 */
@Getter
public class DomainException extends RuntimeException {

    private final String errorCode;

    public DomainException(String errorCode, String message) {
        super(message);
        this.errorCode = errorCode;
    }
}
