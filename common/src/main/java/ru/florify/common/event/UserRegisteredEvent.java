package ru.florify.common.event;

import java.time.Instant;
import java.util.UUID;

/**
 * Shared domain event published when a new user successfully registers.
 * Located in 'common' to maintain isolation and facilitate sharing between services.
 */
public record UserRegisteredEvent(
        UUID userId,
        String email,
        String phone,
        String role,
        Instant occurredAt
) {
    public static UserRegisteredEvent of(UUID userId, String email, String phone, String role, Instant now) {
        return new UserRegisteredEvent(userId, email, phone, role, now);
    }
}
