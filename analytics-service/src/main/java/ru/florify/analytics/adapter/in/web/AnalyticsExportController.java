package ru.florify.analytics.adapter.in.web;

import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import ru.florify.analytics.application.port.in.ExportReportUseCase;
import ru.florify.analytics.application.query.ExportReportQuery;
import ru.florify.analytics.domain.enums.ReportType;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/v1/analytics/export")
@RequiredArgsConstructor
@Tag(name = "Analytics Export", description = "Экспорт отчетов")
public class AnalyticsExportController {
    private final ExportReportUseCase exportReportUseCase;

    @GetMapping
    @PreAuthorize("hasAnyRole('OWNER','ADMIN')")
    public ResponseEntity<byte[]> export(
            @RequestParam ReportType report,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to
    ) {
        byte[] file = exportReportUseCase.exportReport(new ExportReportQuery(report, from, to));
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=analytics-report.xlsx")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(file);
    }
}
