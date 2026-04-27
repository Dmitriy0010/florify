package ru.florify.analytics.application.result;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public record EmployeePerformanceResult(List<EmployeePerformanceItem> items) {
    public record EmployeePerformanceItem(
            UUID employeeId,
            String employeeName,
            long ordersHandled,
            BigDecimal totalRevenue,
            BigDecimal avgOrderValue
    ) {}
}
