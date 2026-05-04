package ru.florify.analytics.adapter.out.persistence.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import ru.florify.analytics.adapter.out.persistence.entity.OrderFactJpaEntity;
import ru.florify.analytics.adapter.out.persistence.projection.EmployeePerformanceProjection;
import ru.florify.analytics.adapter.out.persistence.projection.SalesDataPointProjection;
import ru.florify.analytics.adapter.out.persistence.projection.TopProductProjection;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface OrderFactJpaRepository extends JpaRepository<OrderFactJpaEntity, UUID> {
    Optional<OrderFactJpaEntity> findByOrderId(UUID orderId);

    @Query("select count(o) from OrderFactJpaEntity o " +
           "where (:storeId is null or o.storeId = :storeId) " +
           "and o.completedAt >= :from and o.completedAt <= :to and o.status = 'COMPLETED'")
    long countOrders(UUID storeId, Instant from, Instant to);

    @Query("select coalesce(sum(o.totalAmount), 0) from OrderFactJpaEntity o " +
           "where (:storeId is null or o.storeId = :storeId) " +
           "and o.completedAt >= :from and o.completedAt <= :to and o.status = 'COMPLETED'")
    BigDecimal sumRevenue(UUID storeId, Instant from, Instant to);

    @Query("select count(o) from OrderFactJpaEntity o " +
           "where (:storeId is null or o.storeId = :storeId) " +
           "and o.cancelledAt >= :from and o.cancelledAt <= :to and o.status = 'CANCELLED'")
    long countCancelledOrders(UUID storeId, Instant from, Instant to);

    @Query("select count(distinct o.customerId) from OrderFactJpaEntity o where o.customerId is not null")
    long countDistinctCustomers();

    @Query("select count(o.customerId) from OrderFactJpaEntity o where o.customerId is not null group by o.customerId having count(o.customerId) > 1")
    List<Long> countRepeatCustomers();

    // Projections for aggregate queries
    @Query("select new ru.florify.analytics.adapter.out.persistence.projection.SalesDataPointProjection(" +
           "cast(o.completedAt as localdate), count(o), sum(o.totalAmount), sum(o.grossProfit)) " +
           "from OrderFactJpaEntity o " +
           "where (:storeId is null or o.storeId = :storeId) " +
           "and o.completedAt >= :from and o.completedAt <= :to and o.status = 'COMPLETED' " +
           "group by cast(o.completedAt as localdate) order by cast(o.completedAt as localdate)")
    List<SalesDataPointProjection> aggregateSalesReportByDay(UUID storeId, Instant from, Instant to);

    @Query("select new ru.florify.analytics.adapter.out.persistence.projection.TopProductProjection(" +
           "o.orderId, 'Unknown Product', sum(cast(o.itemCount as bigdecimal)), sum(o.totalAmount)) " + // Note: OrderFact doesn't have productId, usually TopProducts requires a separate table or joining facts
           "from OrderFactJpaEntity o " +
           "where o.completedAt >= :from and o.completedAt <= :to and o.status = 'COMPLETED' " +
           "group by o.orderId") // This is a placeholder as OrderFact doesn't store per-item details
    List<TopProductProjection> findTopProductsPlaceholder(Instant from, Instant to);

    @Query("select new ru.florify.analytics.adapter.out.persistence.projection.EmployeePerformanceProjection(" +
           "o.assignedEmployeeId, 'Employee Name', count(o), sum(o.totalAmount)) " +
           "from OrderFactJpaEntity o " +
           "where (:storeId is null or o.storeId = :storeId) " +
           "and o.completedAt >= :from and o.completedAt <= :to and o.status = 'COMPLETED' " +
           "and o.assignedEmployeeId is not null " +
           "group by o.assignedEmployeeId")
    List<EmployeePerformanceProjection> aggregateEmployeePerformance(UUID storeId, Instant from, Instant to);
}
