package ru.florify.common.security;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * JWT configuration properties bound from application.yaml:
 * <pre>
 * jwt:
 *   secret: "..."
 *   issuer: florify-auth
 *   access-token-ttl-minutes: 1440
 * </pre>
 */
@Data
@Component
@ConfigurationProperties(prefix = "jwt")
public class JwtProperties {

    /** HMAC-SHA256 signing secret. Must be at least 32 characters. */
    private String secret;

    /** Token issuer claim value. */
    private String issuer = "florify-auth";

    /** Access token time-to-live in minutes (default: 24 hours). */
    private long accessTokenTtlMinutes = 1440;
}
