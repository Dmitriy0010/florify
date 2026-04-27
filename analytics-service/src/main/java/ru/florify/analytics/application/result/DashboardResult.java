package ru.florify.analytics.application.result;

import java.math.BigDecimal;

public record DashboardResult(
        long totalOrders,
        BigDecimal totalRevenue,
        BigDecimal averageCheck,
        long cancelledOrders,
        BigDecimal writeOffAmount
) {
}
