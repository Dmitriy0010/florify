package ru.florify.analytics.adapter.in.web;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import ru.florify.analytics.application.port.in.GetSalesReportUseCase;
import ru.florify.analytics.application.query.SalesReportQuery;
import ru.florify.analytics.application.result.SalesReportResult;
import ru.florify.analytics.domain.enums.GroupByPeriod;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/v1/analytics/sales")
@RequiredArgsConstructor
@Tag(name = "Analytics Sales", description = "Аналитика продаж")
public class AnalyticsSalesController {
    private final GetSalesReportUseCase getSalesReportUseCase;

    @GetMapping
    @PreAuthorize("hasAnyRole('OWNER','ADMIN')")
    @Operation(summary = "Получить отчет продаж")
    public SalesReportResult getSales(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(defaultValue = "DAY") GroupByPeriod groupBy
    ) {
        return getSalesReportUseCase.getSalesReport(new SalesReportQuery(from, to, groupBy));
    }
}
