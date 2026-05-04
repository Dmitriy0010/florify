package ru.florify.analytics.application.query;

import ru.florify.analytics.domain.enums.ReportType;
import java.time.LocalDate;
import java.util.Objects;

public record ExportReportQuery(ReportType reportType, LocalDate from, LocalDate to, String format) {
    public ExportReportQuery {
        Objects.requireNonNull(reportType, "reportType must not be null");
        Objects.requireNonNull(from, "from must not be null");
        Objects.requireNonNull(to, "to must not be null");
        if (from.isAfter(to)) {
            throw new IllegalArgumentException("from must not be after to");
        }
    }
}
