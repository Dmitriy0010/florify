package ru.florify.analytics.adapter.out.persistence.projection;

import java.math.BigDecimal;
import java.time.LocalDate;

public record SalesDataPointProjection(
        LocalDate date,
        long orders,
        BigDecimal revenue,
        BigDecimal profit
) {}
