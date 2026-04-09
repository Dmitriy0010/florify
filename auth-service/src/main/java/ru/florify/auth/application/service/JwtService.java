package ru.florify.auth.application.service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jws;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import ru.florify.common.security.JwtProperties;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import java.util.Optional;
import java.util.UUID;

import ru.florify.auth.domain.model.User;


/**
 * Service for generating and validating JWT tokens.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class JwtService {

    private final JwtProperties jwtProperties;

    /**
     * Generates an access token for the given user, embedding their roles.
     */
    public String generateAccessToken(User user) {
        Instant now = Instant.now();
        Instant expiresAt = now.plusSeconds(jwtProperties.getAccessTokenTtlMinutes() * 60);

        var key = Keys.hmacShaKeyFor(jwtProperties.getSecret().getBytes(StandardCharsets.UTF_8));
        
        return Jwts.builder()
                .subject(user.getId().toString())
                .claim("roles", user.getRoles().stream().map(Enum::name).toList())
                .issuer(jwtProperties.getIssuer())
                .issuedAt(Date.from(now))
                .expiration(Date.from(expiresAt))
                .signWith(key)
                .compact();
    }

    /**
     * Validates a token and extracts the subject (user ID).
     */
    public Optional<UUID> validateAndExtractUserId(String token) {
        try {
            var key = Keys.hmacShaKeyFor(jwtProperties.getSecret().getBytes(StandardCharsets.UTF_8));
            Jws<Claims> jws = Jwts.parser()
                    .verifyWith(key)
                    .build()
                    .parseSignedClaims(token);

            String subject = jws.getPayload().getSubject();
            return Optional.of(UUID.fromString(subject));
        } catch (Exception ex) {
            log.debug("Invalid JWT: {}", ex.getMessage());
            return Optional.empty();
        }
    }
}
