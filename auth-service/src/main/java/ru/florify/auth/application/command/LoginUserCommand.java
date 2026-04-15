package ru.florify.auth.application.command;

/**
 * Command DTO for returning user login credentials.
 */
public record LoginUserCommand(
        String email,
        String password,
        String deviceInfo
) {}
