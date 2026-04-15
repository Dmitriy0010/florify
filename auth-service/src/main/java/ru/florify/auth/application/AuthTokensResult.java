package ru.florify.auth.application;

import ru.florify.auth.domain.model.Role;

import java.time.Instant;
import java.util.Set;
import java.util.UUID;

/**
 * Application-layer result DTO containing authentication tokens and user information.
 * This is NOT a domain model and NOT a web DTO.
 */
public record AuthTokensResult(
        String accessToken,
        String refreshToken,
        Instant accessTokenExpiresAt,
        Instant refreshTokenExpiresAt,
        UUID userId,
        Set<Role> roles
) {}
