package ru.florify.analytics.application.port.in;

import ru.florify.analytics.application.query.SalesReportQuery;
import ru.florify.analytics.application.result.SalesReportResult;

public interface GetSalesReportUseCase {
    SalesReportResult getSalesReport(SalesReportQuery query);
}
