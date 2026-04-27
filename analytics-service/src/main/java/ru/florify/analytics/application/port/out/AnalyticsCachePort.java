package ru.florify.analytics.application.port.out;

import ru.florify.analytics.application.result.DashboardResult;
import ru.florify.analytics.application.result.SalesReportResult;

import java.time.Duration;
import java.util.Optional;

public interface AnalyticsCachePort {
    Optional<DashboardResult> getCachedDashboard();
    void cacheDashboard(DashboardResult result, Duration ttl);
    void evictDashboard();
    Optional<SalesReportResult> getCachedSalesReport(String cacheKey);
    void cacheSalesReport(String cacheKey, SalesReportResult result, Duration ttl);
    void evictAllAnalyticsCache();
}
