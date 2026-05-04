package ru.florify.analytics.adapter.out.cache;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Component;
import ru.florify.analytics.application.port.out.AnalyticsCachePort;
import ru.florify.analytics.application.result.DashboardResult;
import ru.florify.analytics.application.result.SalesReportResult;

import java.time.Duration;
import java.util.Optional;
import java.util.Set;

/**
 * Implementation of AnalyticsCachePort using Redis.
 * Uses GlobalRedisConfig (RedisTemplate<String, Object>) from common.
 */
@Component
@RequiredArgsConstructor
public class RedisAnalyticsCacheAdapter implements AnalyticsCachePort {

    private final RedisTemplate<String, Object> redisTemplate;
    private final ObjectMapper objectMapper;
    
    private static final String KEY_PREFIX = "analytics:";
    private static final String DASHBOARD_KEY = KEY_PREFIX + "dashboard";
    private static final String SALES_PREFIX = KEY_PREFIX + "sales:";

    @Override
    public Optional<DashboardResult> getCachedDashboard() {
        Object val = redisTemplate.opsForValue().get(DASHBOARD_KEY);
        if (val == null) return Optional.empty();
        return Optional.of(objectMapper.convertValue(val, DashboardResult.class));
    }

    @Override
    public void cacheDashboard(DashboardResult result, Duration ttl) {
        redisTemplate.opsForValue().set(DASHBOARD_KEY, result, ttl);
    }

    @Override
    public void evictDashboard() {
        redisTemplate.delete(DASHBOARD_KEY);
    }

    @Override
    public Optional<SalesReportResult> getCachedSalesReport(String cacheKey) {
        Object val = redisTemplate.opsForValue().get(SALES_PREFIX + cacheKey);
        if (val == null) return Optional.empty();
        return Optional.of(objectMapper.convertValue(val, SalesReportResult.class));
    }

    @Override
    public void cacheSalesReport(String cacheKey, SalesReportResult result, Duration ttl) {
        redisTemplate.opsForValue().set(SALES_PREFIX + cacheKey, result, ttl);
    }

    @Override
    public void evictAllAnalyticsCache() {
        Set<String> keys = redisTemplate.keys(KEY_PREFIX + "*");
        if (keys != null && !keys.isEmpty()) {
            redisTemplate.delete(keys);
        }
    }
}
