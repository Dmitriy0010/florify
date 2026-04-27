package ru.florify.analytics.application.query;

import ru.florify.analytics.domain.enums.GroupByPeriod;

import java.time.LocalDate;
import java.util.Objects;

public record SalesReportQuery(LocalDate from, LocalDate to, GroupByPeriod groupBy) {
    public SalesReportQuery {
        Objects.requireNonNull(from, "from must not be null");
        Objects.requireNonNull(to, "to must not be null");
        Objects.requireNonNull(groupBy, "groupBy must not be null");
        if (from.isAfter(to)) {
            throw new IllegalArgumentException("from must not be after to");
        }
    }
}
