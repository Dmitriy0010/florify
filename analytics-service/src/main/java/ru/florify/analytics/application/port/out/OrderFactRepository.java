package ru.florify.analytics.application.port.out;

import ru.florify.analytics.application.result.*;
import ru.florify.analytics.domain.enums.GroupByPeriod;
import ru.florify.analytics.domain.model.OrderFact;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface OrderFactRepository {
    void save(OrderFact fact);
    Optional<OrderFact> findByOrderId(UUID orderId);
    void update(OrderFact fact);

    DashboardResult aggregateDashboard(UUID storeId, Instant from, Instant to);
    SalesReportResult aggregateSalesReport(LocalDate from, LocalDate to, GroupByPeriod groupBy);
    List<TopProductItem> findTopProducts(LocalDate from, LocalDate to, int limit);
    CustomerStatsResult aggregateCustomerStats(Instant monthStart);
    EmployeePerformanceResult aggregateEmployeePerformance(LocalDate from, LocalDate to);
}
