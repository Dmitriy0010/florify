package ru.florify.customer.adapter.out.cache;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Component;
import ru.florify.customer.application.port.out.CustomerCachePort;
import ru.florify.customer.domain.model.Customer;

import java.time.Duration;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Component
@RequiredArgsConstructor
public class RedisCustomerCacheAdapter implements CustomerCachePort {

    private final RedisTemplate<String, Object> redisTemplate;
    private final ObjectMapper objectMapper;

    @Value("${app.cache.customer-ttl-minutes:60}")
    private int ttlMinutes;

    private static final String CACHE_PREFIX = "customer:";

    @Override
    public Optional<Customer> get(UUID customerId) {
        try {
            Object cached = redisTemplate.opsForValue().get(CACHE_PREFIX + customerId);
            if (cached == null) {
                return Optional.empty();
            }
            if (cached instanceof Customer c) {
                return Optional.of(c);
            }
            // If Jackson deserialized it as a Map (generic Object)
            Customer customer = objectMapper.convertValue(cached, Customer.class);
            return Optional.ofNullable(customer);
        } catch (Exception e) {
            log.error("Error reading from Redis cache for customer {}", customerId, e);
            return Optional.empty();
        }
    }

    @Override
    public void put(UUID customerId, Customer customer) {
        try {
            redisTemplate.opsForValue().set(
                CACHE_PREFIX + customerId, 
                customer, 
                Duration.ofMinutes(ttlMinutes)
            );
        } catch (Exception e) {
            log.error("Error writing to Redis cache for customer {}", customerId, e);
        }
    }

    @Override
    public void evict(UUID customerId) {
        try {
            redisTemplate.delete(CACHE_PREFIX + customerId);
        } catch (Exception e) {
            log.error("Error evicting from Redis cache for customer {}", customerId, e);
        }
    }
}
