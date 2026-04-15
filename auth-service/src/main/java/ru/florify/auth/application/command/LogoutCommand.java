package ru.florify.auth.application.command;

import java.util.UUID;

/**
 * Command DTO for logging out a user.
 */
public record LogoutCommand(
        String accessToken,
        String refreshToken,
        UUID userId
) {}
