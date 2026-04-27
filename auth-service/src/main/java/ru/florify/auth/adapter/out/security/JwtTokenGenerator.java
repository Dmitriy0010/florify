package ru.florify.auth.adapter.out.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import ru.florify.auth.application.port.out.TokenGenerator;
import ru.florify.auth.domain.model.User;
import ru.florify.common.security.JwtProperties;

import java.nio.charset.StandardCharsets;
import java.time.Clock;
import java.time.Instant;
import java.util.Date;
import java.util.Optional;
import java.util.UUID;

/**
 * JWT-based implementation of the TokenGenerator port.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class JwtTokenGenerator implements TokenGenerator {

    private final JwtProperties jwtProperties;
    private final Clock clock;

    @Override
    public String generateAccessToken(User user) {
        Instant now = Instant.now(clock);
        Instant expiresAt = getAccessTokenExpiration(now);

        var key = Keys.hmacShaKeyFor(jwtProperties.getSecret().getBytes(StandardCharsets.UTF_8));
        
        return Jwts.builder()
                .subject(user.id().toString())
                .claim("roles", user.roles().stream().map(Enum::name).toList())
                .issuer(jwtProperties.getIssuer())
                .issuedAt(Date.from(now))
                .expiration(Date.from(expiresAt))
                .signWith(key)
                .compact();
    }

    @Override
    public Instant getAccessTokenExpiration(Instant issuedAt) {
        return issuedAt.plusSeconds(jwtProperties.getAccessTokenTtlMinutes() * 60);
    }

    @Override
    public Optional<UUID> validateAndExtractUserId(String token) {
        try {
            Claims claims = parseClaims(token);
            return Optional.of(UUID.fromString(claims.getSubject()));
        } catch (Exception ex) {
            log.debug("Invalid JWT: {}", ex.getMessage());
            return Optional.empty();
        }
    }

    @Override
    public UUID extractUserId(String token) {
        return UUID.fromString(parseClaims(token).getSubject());
    }

    @Override
    public Instant getExpiration(String token) {
        return parseClaims(token).getExpiration().toInstant();
    }

    @Override
    public java.time.Duration getRemainingTtl(String token) {
        Instant expiration = getExpiration(token);
        java.time.Duration ttl = java.time.Duration.between(Instant.now(clock), expiration);
        return ttl.isNegative() ? java.time.Duration.ZERO : ttl;
    }

    private Claims parseClaims(String token) {
        var key = Keys.hmacShaKeyFor(jwtProperties.getSecret().getBytes(StandardCharsets.UTF_8));
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
