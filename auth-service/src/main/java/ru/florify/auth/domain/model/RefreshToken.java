package ru.florify.auth.domain.model;

import lombok.*;

import java.time.Instant;
import java.util.UUID;

/**
 * Immutable domain model for a refresh token.
 *
 * The raw token string is NEVER stored here — only its SHA-256 hash.
 * Use {@link #create} to instantiate and {@link #revoke} to invalidate.
 */
@Getter
@Builder
@With
@AllArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class RefreshToken {

    @EqualsAndHashCode.Include
    private final UUID    id;
    private final UUID    userId;

    /** SHA-256 hash of the raw token string. Never store plaintext. */
    private final String  tokenHash;

    /** Browser / device identifier supplied by the client (nullable). */
    private final String  deviceInfo;

    private final Instant expiresAt;
    private final Instant createdAt;

    @With
    private final boolean revoked;

    // ─────────────────────────────── factory ────────────────────────────────

    /**
     * Creates a new, valid refresh token record.
     *
     * @param userId     owner of the token
     * @param tokenHash  SHA-256 hash of the raw token string
     * @param ttlDays    how many days the token stays valid
     * @param deviceInfo optional client device description
     */
    public static RefreshToken create(UUID userId, String tokenHash, long ttlDays, String deviceInfo, Instant now) {
        return RefreshToken.builder()
                .id(UUID.randomUUID())
                .userId(userId)
                .tokenHash(tokenHash)
                .deviceInfo(deviceInfo)
                .expiresAt(now.plusSeconds(ttlDays * 24 * 60 * 60))
                .createdAt(now)
                .revoked(false)
                .build();
    }

    // ───────────────────────────── behaviour ────────────────────────────────

    /** @return true when the token's expiry instant is in the past */
    public boolean isExpired(Instant now) {
        return now.isAfter(expiresAt);
    }

    /** @return true only when the token has not been revoked AND has not expired */
    public boolean isValid(Instant now) {
        return !revoked && !isExpired(now);
    }

    /**
     * Returns a new {@link RefreshToken} identical to this one but with
     * {@code revoked = true}. Original instance is unchanged (immutable).
     */
    public RefreshToken revoke() {
        return withRevoked(true);
    }
}
