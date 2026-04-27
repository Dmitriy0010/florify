package ru.florify.auth.application.port.out;

/**
 * Port for accessing token-related configuration.
 */
public interface TokenConfigPort {
    
    /**
     * @return TTL of a refresh token in days.
     */
    long getRefreshTokenTtlDays();
}
