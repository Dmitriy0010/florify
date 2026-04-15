package ru.florify.auth.domain.model;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.Set;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

class UserTest {

    @Test
    @DisplayName("Should create user via builder and maintain immutability")
    void shouldCreateUser() {
        UUID id = UUID.randomUUID();
        User user = User.builder()
                .id(id)
                .email("test@example.com")
                .roles(Set.of(Role.CUSTOMER))
                .active(true)
                .build();

        assertEquals(id, user.getId());
        assertEquals("test@example.com", user.getEmail());
        assertTrue(user.getRoles().contains(Role.CUSTOMER));
        assertTrue(user.isActive());
    }

    @Test
    @DisplayName("Should create new instance with modified field using With")
    void shouldSupportWith() {
        User user = User.builder()
                .email("old@example.com")
                .active(true)
                .build();

        User deactivated = user.withActive(false);

        assertNotSame(user, deactivated);
        assertTrue(user.isActive());
        assertFalse(deactivated.isActive());
        assertEquals(user.getEmail(), deactivated.getEmail());
    }
}
