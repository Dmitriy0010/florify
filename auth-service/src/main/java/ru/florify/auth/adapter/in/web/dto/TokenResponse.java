package ru.florify.auth.adapter.in.web.dto;

import java.time.Instant;
import java.util.UUID;

public record TokenResponse(
        String accessToken,
        String refreshToken,
        Instant accessTokenExpiresAt,
        Instant refreshTokenExpiresAt,
        UUID userId,
        java.util.Set<String> roles
) {}
