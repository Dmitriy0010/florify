package ru.florify.auth.application.command;

/**
 * Command DTO for refreshing authentication tokens.
 */
public record RefreshTokenCommand(
        String refreshToken,
        String deviceInfo
) {}
