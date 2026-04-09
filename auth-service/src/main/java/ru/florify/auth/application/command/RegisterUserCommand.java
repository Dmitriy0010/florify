package ru.florify.auth.application.command;

/**
 * Command DTO for registering a new user.
 */
public record RegisterUserCommand(
        String email,
        String password
) {}
