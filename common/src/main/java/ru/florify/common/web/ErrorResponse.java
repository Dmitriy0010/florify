package ru.florify.common.web;

import lombok.Builder;

import java.time.Instant;

/**
 * Unified error response DTO.
 * <p>
 * Every error returned by any Florify service will have exactly this shape.
 */
@Builder
public record ErrorResponse(
        String errorCode,
        String message,
        Instant timestamp
) {
    public static ErrorResponse of(String errorCode, String message) {
        return ErrorResponse.builder()
                .errorCode(errorCode)
                .message(message)
                .timestamp(Instant.now())
                .build();
    }
}
