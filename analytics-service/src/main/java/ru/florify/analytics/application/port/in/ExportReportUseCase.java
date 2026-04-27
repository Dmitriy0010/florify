package ru.florify.analytics.application.port.in;

import ru.florify.analytics.application.query.ExportReportQuery;

public interface ExportReportUseCase {
    byte[] exportReport(ExportReportQuery query);
}
