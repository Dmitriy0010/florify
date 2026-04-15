package ru.florify.auth.domain.model;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.Instant;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

class RefreshTokenTest {

    @Test
    @DisplayName("Should create valid token and correctly check expiration")
    void shouldCreateAndCheckExpiration() {
        UUID userId = UUID.randomUUID();
        Instant now = Instant.now();
        // Valid for 1 day
        RefreshToken token = RefreshToken.create(userId, "hash", 1, "device", now);

        assertNotNull(token.getId());
        assertEquals(userId, token.getUserId());
        assertFalse(token.isRevoked());
        assertFalse(token.isExpired(now));
        assertTrue(token.isValid(now));
    }

    @Test
    @DisplayName("Should be invalid when revoked")
    void shouldBeInvalidWhenRevoked() {
        RefreshToken token = RefreshToken.create(UUID.randomUUID(), "hash", 1, "device", Instant.now());
        RefreshToken revokedToken = token.revoke();

        assertTrue(revokedToken.isRevoked());
        assertFalse(revokedToken.isValid(Instant.now()));
        // Original should remain unchanged (immutability check)
        assertFalse(token.isRevoked());
    }

    @Test
    @DisplayName("Should be invalid when expired")
    void shouldBeInvalidWhenExpired() {
        // Create token with past expiration
        RefreshToken expiredToken = RefreshToken.builder()
                .id(UUID.randomUUID())
                .userId(UUID.randomUUID())
                .tokenHash("hash")
                .expiresAt(Instant.now().minusSeconds(10))
                .revoked(false)
                .build();

        assertTrue(expiredToken.isExpired(Instant.now()));
        assertFalse(expiredToken.isValid(Instant.now()));
    }
}
