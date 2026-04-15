package ru.florify.auth.application.command;

import ru.florify.auth.domain.model.Role;

import java.util.UUID;

/**
 * Command DTO for assigning a role to a user.
 */
public record AssignRoleCommand(
        UUID targetUserId,
        Role role,
        UUID performerUserId
) {}
