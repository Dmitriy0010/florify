package ru.florify.analytics.adapter.out.persistence.adapter;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import ru.florify.analytics.adapter.out.persistence.entity.OrderFactJpaEntity;
import ru.florify.analytics.adapter.out.persistence.mapper.OrderFactPersistenceMapper;
import ru.florify.analytics.adapter.out.persistence.repository.OrderFactJpaRepository;
import ru.florify.analytics.application.port.out.OrderFactRepository;
import ru.florify.analytics.application.result.*;
import ru.florify.analytics.domain.enums.GroupByPeriod;
import ru.florify.analytics.domain.model.OrderFact;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class OrderFactPersistenceAdapter implements OrderFactRepository {
    private final OrderFactJpaRepository repository;
    private final OrderFactPersistenceMapper mapper;

    @Override
    public void save(OrderFact fact) {
        repository.save(mapper.toEntity(fact));
    }

    @Override
    public Optional<OrderFact> findByOrderId(UUID orderId) {
        return repository.findByOrderId(orderId).map(mapper::toDomain);
    }

    @Override
    public void update(OrderFact fact) {
        repository.save(mapper.toEntity(fact));
    }

    @Override
    public DashboardResult aggregateDashboard(UUID storeId, Instant from, Instant to) {
        long totalOrders = repository.countOrders(storeId, from, to);
        BigDecimal totalRevenue = repository.sumRevenue(storeId, from, to);
        long cancelledOrders = repository.countCancelledOrders(storeId, from, to);
        
        BigDecimal avgCheck = totalOrders > 0 
                ? totalRevenue.divide(BigDecimal.valueOf(totalOrders), 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        return new DashboardResult(
            totalOrders,
            totalRevenue != null ? totalRevenue : BigDecimal.ZERO,
            avgCheck,
            cancelledOrders,
            BigDecimal.ZERO // writeOff placeholder
        );
    }

    @Override
    public SalesReportResult aggregateSalesReport(LocalDate from, LocalDate to, GroupByPeriod groupBy) {
        Instant fromInstant = from.atStartOfDay().toInstant(ZoneOffset.UTC);
        Instant toInstant = to.plusDays(1).atStartOfDay().toInstant(ZoneOffset.UTC).minusSeconds(1);
        
        List<SalesReportResult.SalesDataPoint> points = repository.aggregateSalesReportByDay(null, fromInstant, toInstant)
            .stream()
            .map(p -> new SalesReportResult.SalesDataPoint(p.date(), p.orders(), p.revenue(), p.profit()))
            .toList();
            
        return new SalesReportResult(points);
    }

    @Override
    public List<TopProductItem> findTopProducts(LocalDate from, LocalDate to, int limit) {
        return List.of(); 
    }

    @Override
    public CustomerStatsResult aggregateCustomerStats(Instant monthStart) {
        return new CustomerStatsResult(
            repository.countDistinctCustomers(),
            (long) repository.countRepeatCustomers().size()
        );
    }

    @Override
    public EmployeePerformanceResult aggregateEmployeePerformance(LocalDate from, LocalDate to) {
        Instant fromInstant = from.atStartOfDay().toInstant(ZoneOffset.UTC);
        Instant toInstant = to.plusDays(1).atStartOfDay().toInstant(ZoneOffset.UTC).minusSeconds(1);

        List<EmployeePerformanceResult.EmployeePerformanceItem> items = repository.aggregateEmployeePerformance(null, fromInstant, toInstant)
            .stream()
            .map(p -> new EmployeePerformanceResult.EmployeePerformanceItem(
                p.employeeId(),
                p.employeeName(),
                p.ordersHandled(),
                p.totalRevenue(),
                p.ordersHandled() > 0 
                        ? p.totalRevenue().divide(BigDecimal.valueOf(p.ordersHandled()), 2, RoundingMode.HALF_UP) 
                        : BigDecimal.ZERO
            ))
            .toList();
            
        return new EmployeePerformanceResult(items);
    }
}
