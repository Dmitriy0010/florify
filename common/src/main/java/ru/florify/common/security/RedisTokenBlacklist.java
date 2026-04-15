package ru.florify.common.security;
 
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;
 
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Duration;
import java.util.HexFormat;
 
/**
 * Shared implementation of TokenBlacklist using Redis.
 * Keys are SHA-256 hashes of the raw tokens for security and consistency across services.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class RedisTokenBlacklist implements TokenBlacklist {
 
    private final StringRedisTemplate redisTemplate;
    private static final String PREFIX = "auth:blacklist:";
 
    @Override
    public void blacklist(String rawAccessToken, Duration ttl) {
        String key = getBlacklistKey(rawAccessToken);
        log.debug("Blacklisting token with key: {}, TTL: {}", key, ttl);
        redisTemplate.opsForValue().set(key, "1", ttl);
    }
 
    @Override
    public boolean isBlacklisted(String rawAccessToken) {
        String key = getBlacklistKey(rawAccessToken);
        return Boolean.TRUE.equals(redisTemplate.hasKey(key));
    }
 
    private String getBlacklistKey(String token) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(token.getBytes(StandardCharsets.UTF_8));
            return PREFIX + HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 algorithm not found", e);
        }
    }
}
