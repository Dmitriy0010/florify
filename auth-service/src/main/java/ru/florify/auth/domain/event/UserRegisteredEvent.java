package ru.florify.auth.domain.event;

import lombok.Builder;
import lombok.Value;
import ru.florify.auth.domain.model.Role;
import ru.florify.auth.domain.model.User;

import java.time.Instant;
import java.util.Set;
import java.util.UUID;

/**
 * Domain event published when a new user successfully registers.
 *
 * Consumed by:
 *   - customer-service  → create a Customer profile (if role == CLIENT)
 *   - employee-service  → create an Employee record  (if role != CLIENT)
 *
 * No Spring imports — pure Java record-style value object.
 */
@Value
@Builder
public class UserRegisteredEvent {

    UUID       eventId;
    UUID       userId;
    String     email;
    String     phone;
    String     firstName;
    String     lastName;
    Set<Role>  roles;
    Instant    occurredAt;

    /**
     * Convenience factory that builds the event straight from a {@link User}.
     */
    public static UserRegisteredEvent from(User user) {
        return UserRegisteredEvent.builder()
                .eventId(UUID.randomUUID())
                .userId(user.getId())
                .email(user.getEmail())
                .phone(user.getPhone())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .roles(user.getRoles())
                .occurredAt(Instant.now())
                .build();
    }
}
