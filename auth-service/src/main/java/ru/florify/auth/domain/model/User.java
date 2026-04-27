package ru.florify.auth.domain.model;

import java.time.Instant;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;

/**
 * Pure domain model of a Florify user.
 *
 * Immutable by design (record). No JPA, no Spring — clean Java.
 */
public record User(
    UUID id,
    String email,
    String phone,
    String firstName,
    String lastName,
    String passwordHash,
    Set<Role> roles,
    boolean active,
    Instant createdAt
) {

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        User user = (User) o;
        return Objects.equals(id, user.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }

    // Manual "with" methods for cloning with changes
    public User withEmail(String email) {
        return new User(id, email, phone, firstName, lastName, passwordHash, roles, active, createdAt);
    }

    public User withRoles(Set<Role> roles) {
        return new User(id, email, phone, firstName, lastName, passwordHash, roles, active, createdAt);
    }

    public User withPasswordHash(String passwordHash) {
        return new User(id, email, phone, firstName, lastName, passwordHash, roles, active, createdAt);
    }

    public User withActive(boolean active) {
        return new User(id, email, phone, firstName, lastName, passwordHash, roles, active, createdAt);
    }

    /**
     * Minimalist builder for compatibility and convenience.
     */
    public static UserBuilder builder() {
        return new UserBuilder();
    }

    public static class UserBuilder {
        private UUID id;
        private String email;
        private String phone;
        private String firstName;
        private String lastName;
        private String passwordHash;
        private Set<Role> roles;
        private boolean active;
        private Instant createdAt;

        public UserBuilder id(UUID id) { this.id = id; return this; }
        public UserBuilder email(String email) { this.email = email; return this; }
        public UserBuilder phone(String phone) { this.phone = phone; return this; }
        public UserBuilder firstName(String firstName) { this.firstName = firstName; return this; }
        public UserBuilder lastName(String lastName) { this.lastName = lastName; return this; }
        public UserBuilder passwordHash(String passwordHash) { this.passwordHash = passwordHash; return this; }
        public UserBuilder roles(Set<Role> roles) { this.roles = roles; return this; }
        public UserBuilder active(boolean active) { this.active = active; return this; }
        public UserBuilder createdAt(Instant createdAt) { this.createdAt = createdAt; return this; }

        public User build() {
            return new User(id, email, phone, firstName, lastName, passwordHash, roles, active, createdAt);
        }
    }
}
