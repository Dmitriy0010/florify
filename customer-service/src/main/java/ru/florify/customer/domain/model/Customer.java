package ru.florify.customer.domain.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.With;
import ru.florify.customer.domain.enums.CustomerSource;
import ru.florify.customer.domain.enums.Gender;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import lombok.extern.jackson.Jacksonized;

/**
 * Customer — Rich Domain Object (RDO).
 * Contains domain logic for linking users, deactivating, and updating tags.
 */
@Getter
@Builder
@With
@Jacksonized
@AllArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class Customer {

    @EqualsAndHashCode.Include
    private final UUID id;

    private final String phone;           // Unique among active=true
    private final String email;
    private final String firstName;
    private final String lastName;
    private final LocalDate birthDate;    // nullable

    @Builder.Default
    private final Gender gender = Gender.UNSPECIFIED;
    private final CustomerSource source;
    private final List<String> tags;
    private final UUID userId;            // nullable; reference to auth-service
    private final boolean active;
    private final Instant createdAt;
    private final Instant updatedAt;

    /** Link to a registered user */
    public Customer linkUser(UUID userId, Instant now) {
        return this.withUserId(userId).withUpdatedAt(now);
    }

    /** Deactivate customer */
    public Customer deactivate(Instant now) {
        return this.withActive(false).withUpdatedAt(now);
    }

    /** Full tag update (not append) */
    public Customer updateTags(List<String> newTags, Instant now) {
        return this.withTags(List.copyOf(newTags)).withUpdatedAt(now);
    }
}
