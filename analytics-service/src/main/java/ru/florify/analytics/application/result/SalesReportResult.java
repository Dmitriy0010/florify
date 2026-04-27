package ru.florify.analytics.application.result;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record SalesReportResult(List<SalesDataPoint> points) {
    public record SalesDataPoint(LocalDate period, long ordersCount, BigDecimal revenue, BigDecimal grossProfit) {
    }
}
