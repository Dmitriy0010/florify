package ru.florify.auth.application.port.out;

import ru.florify.auth.domain.model.User;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

/**
 * Outbound port for token generation and validation.
 * Abstracts away the underlying technology (e.g., JWT).
 */
public interface TokenGenerator {

    /**
     * Generates an access token for the given user.
     */
    String generateAccessToken(User user);

    /**
     * Calculates the expiration time for an access token issued at the given time.
     */
    Instant getAccessTokenExpiration(Instant issuedAt);

    /**
     * Extracts user ID from the token. Returns empty if invalid or expired.
     */
    Optional<UUID> validateAndExtractUserId(String token);

    /**
     * Extracts user ID from the token without full validation (use with caution).
     */
    UUID extractUserId(String token);

    /**
     * Gets the expiration time of the token.
     */
    Instant getExpiration(String token);

    /**
     * Calculates the remaining time to live for the token.
     */
    java.time.Duration getRemainingTtl(String token);
}
