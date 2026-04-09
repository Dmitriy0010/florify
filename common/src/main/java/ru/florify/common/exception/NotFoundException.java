package ru.florify.common.exception;

/**
 * Thrown when a requested resource cannot be found.
 * Maps to HTTP 404.
 *
 * @see ru.florify.common.web.GlobalExceptionHandler#handleNotFoundException
 */
public class NotFoundException extends DomainException {

    public NotFoundException(String resourceName, Object id) {
        super("NOT_FOUND", resourceName + " not found: " + id);
    }
}
