package ru.florify.auth.adapter.in.web.dto;

import ru.florify.auth.domain.model.Role;
import ru.florify.auth.domain.model.User;

import java.time.Instant;
import java.util.Set;
import java.util.UUID;

/**
 * Response DTO for user profile information.
 */
public record UserResponse(
        UUID id,
        String email,
        String phone,
        String firstName,
        String lastName,
        Set<Role> roles,
        Instant createdAt
) {
}
