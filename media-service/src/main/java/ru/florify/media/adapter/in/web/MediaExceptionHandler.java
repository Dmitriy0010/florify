package ru.florify.media.adapter.in.web;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import ru.florify.common.web.ErrorResponse;
import ru.florify.media.domain.exception.UnsupportedMediaTypeException;

@RestControllerAdvice
public class MediaExceptionHandler {

    @ExceptionHandler(UnsupportedMediaTypeException.class)
    @ResponseStatus(HttpStatus.UNSUPPORTED_MEDIA_TYPE)
    public ErrorResponse handleUnsupportedMediaType(UnsupportedMediaTypeException ex) {
        return ErrorResponse.of(ex.getErrorCode(), ex.getMessage());
    }
}

