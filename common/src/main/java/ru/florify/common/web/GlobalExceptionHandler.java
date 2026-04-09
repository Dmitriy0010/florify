package ru.florify.common.web;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import ru.florify.common.exception.*;

import java.util.stream.Collectors;

/**
 * Centralised exception → HTTP response mapping for all Florify REST controllers.
 * No controller needs its own try/catch — every domain exception lands here.
 */
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(NotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public ErrorResponse handleNotFound(NotFoundException ex) {
        return ErrorResponse.of(ex.getErrorCode(), ex.getMessage());
    }

    @ExceptionHandler(ConflictException.class)
    @ResponseStatus(HttpStatus.CONFLICT)
    public ErrorResponse handleConflict(ConflictException ex) {
        return ErrorResponse.of(ex.getErrorCode(), ex.getMessage());
    }

    @ExceptionHandler(UnauthorizedException.class)
    @ResponseStatus(HttpStatus.UNAUTHORIZED)
    public ErrorResponse handleUnauthorized(UnauthorizedException ex) {
        return ErrorResponse.of(ex.getErrorCode(), ex.getMessage());
    }

    @ExceptionHandler(ForbiddenException.class)
    @ResponseStatus(HttpStatus.FORBIDDEN)
    public ErrorResponse handleForbidden(ForbiddenException ex) {
        return ErrorResponse.of(ex.getErrorCode(), ex.getMessage());
    }

    /**
     * Covers TokenExpiredException and TokenInvalidException — both map to 401.
     * Must be declared BEFORE the generic DomainException handler.
     */
    @ExceptionHandler({TokenExpiredException.class, TokenInvalidException.class})
    @ResponseStatus(HttpStatus.UNAUTHORIZED)
    public ErrorResponse handleTokenErrors(DomainException ex) {
        return ErrorResponse.of(ex.getErrorCode(), ex.getMessage());
    }

    @ExceptionHandler(DomainException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ErrorResponse handleDomain(DomainException ex) {
        return ErrorResponse.of(ex.getErrorCode(), ex.getMessage());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseStatus(HttpStatus.UNPROCESSABLE_ENTITY)
    public ErrorResponse handleValidation(MethodArgumentNotValidException ex) {
        String details = ex.getBindingResult().getFieldErrors().stream()
                .map(FieldError::getDefaultMessage)
                .collect(Collectors.joining("; "));
        return ErrorResponse.of("VALIDATION_FAILED", details);
    }

    @ExceptionHandler(Exception.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public ErrorResponse handleGeneric(Exception ex) {
        log.error("Unexpected error", ex);
        return ErrorResponse.of("INTERNAL_ERROR", "An unexpected error occurred");
    }
}
