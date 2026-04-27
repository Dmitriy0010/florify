package ru.florify.analytics.application.query;

import java.time.LocalDate;

public record TopProductsQuery(LocalDate from, LocalDate to, int limit) {
    public TopProductsQuery {
        if (limit < 1 || limit > 50) {
            throw new IllegalArgumentException("limit must be between 1 and 50");
        }
        if (from != null && to != null && from.isAfter(to)) {
            throw new IllegalArgumentException("from must not be after to");
        }
    }
}
