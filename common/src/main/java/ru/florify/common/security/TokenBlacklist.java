package ru.florify.common.security;

import java.time.Duration;

/**
 * Outbound port — short-lived access-token blacklist.
 *
 * After logout the access token (still cryptographically valid until its exp)
 * is added here. Every authenticated request checks this list before proceeding.
 *
 * Storage key MUST be a hash of the raw token — never store the token itself.
 */
public interface TokenBlacklist {

    /**
     * @param rawAccessToken the raw JWT string
     * @return true if the token has been blacklisted and must be rejected
     */
    boolean isBlacklisted(String rawAccessToken);

    /**
     * Adds a token to the blacklist with a specific TTL.
     * @param rawAccessToken the raw JWT string
     * @param ttl duration until the token expiration
     */
    void blacklist(String rawAccessToken, java.time.Duration ttl);
}
