package ru.florify.analytics.application.port.out;

import ru.florify.analytics.application.result.ExportReportData;

public interface ReportExportPort {
    byte[] generateExcel(ExportReportData data);
    byte[] generatePdf(ExportReportData data);
}
