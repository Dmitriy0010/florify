package ru.florify.auth.domain.model;

import lombok.Builder;
import lombok.Value;

import java.time.Instant;
import java.util.Set;
import java.util.UUID;

/**
 * Pure domain model of a Florify user.
 *
 * Immutable by design (@Value). No JPA, no Spring — clean Java.
 * Created exclusively via the builder to enforce invariants.
 */
@Value
@Builder
public class User {

    UUID       id;
    String     email;

    /** Nullable — employees may not have a phone; clients use it for login */
    String     phone;

    String     firstName;
    String     lastName;
    String     passwordHash;
    Set<Role>  roles;
    boolean    active;
    Instant    createdAt;
}
