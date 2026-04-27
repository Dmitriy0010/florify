package ru.florify.auth.application.port.out;

import ru.florify.auth.domain.model.RefreshToken;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Outbound port — persistence contract for {@link RefreshToken}.
 */
public interface RefreshTokenRepository {

    RefreshToken save(RefreshToken token);

    /** Lookup by the SHA-256 hash of the raw token string. */
    Optional<RefreshToken> findByTokenHash(String tokenHash);

    /** All tokens for a user — used to show active sessions. */
    List<RefreshToken> findAllByUserId(UUID userId);

    /**
     * Bulk-revoke all tokens for a user.
     * Used by "logout from all devices".
     */
    void revokeAllByUserId(UUID userId);
}
