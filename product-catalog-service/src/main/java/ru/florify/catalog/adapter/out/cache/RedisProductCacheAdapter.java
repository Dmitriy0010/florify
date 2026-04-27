package ru.florify.catalog.adapter.out.cache;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Component;
import ru.florify.catalog.application.port.out.ProductCachePort;
import ru.florify.catalog.domain.model.Product;

import java.time.Duration;
import java.util.Optional;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class RedisProductCacheAdapter implements ProductCachePort {

    private final RedisTemplate<String, Object> redisTemplate;
    private static final String CACHE_KEY_PREFIX = "catalog:product:";
    private static final Duration CACHE_TTL = Duration.ofHours(1);

    @Override
    public Optional<Product> get(UUID productId) {
        Object cached = redisTemplate.opsForValue().get(CACHE_KEY_PREFIX + productId);
        if (cached instanceof Product) {
            return Optional.of((Product) cached);
        }
        return Optional.empty();
    }

    @Override
    public void put(UUID productId, Product product) {
        redisTemplate.opsForValue().set(CACHE_KEY_PREFIX + productId, product, CACHE_TTL);
    }

    @Override
    public void evict(UUID productId) {
        redisTemplate.delete(CACHE_KEY_PREFIX + productId);
    }
}
