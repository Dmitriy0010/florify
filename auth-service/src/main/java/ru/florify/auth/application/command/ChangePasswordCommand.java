package ru.florify.auth.application.command;

import java.util.UUID;

public record ChangePasswordCommand(
        UUID userId,
        String currentPassword,
        String newPassword,
        String rawAccessToken
) {}
