package ru.florify.analytics.adapter.out.persistence.projection;

import java.math.BigDecimal;
import java.util.UUID;

public record EmployeePerformanceProjection(
        UUID employeeId,
        String employeeName,
        long ordersHandled,
        BigDecimal totalRevenue
) {}
