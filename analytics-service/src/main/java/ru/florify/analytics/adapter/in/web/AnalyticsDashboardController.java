package ru.florify.analytics.adapter.in.web;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import ru.florify.analytics.application.port.in.GetDashboardUseCase;
import ru.florify.analytics.application.result.DashboardResult;

import org.springframework.format.annotation.DateTimeFormat;
import java.time.Instant;
import java.util.UUID;
import org.springframework.web.bind.annotation.RequestParam;

@RestController
@RequestMapping("/api/v1/analytics/dashboard")
@RequiredArgsConstructor
@Tag(name = "Analytics Dashboard", description = "Операционные метрики и dashboard")
public class AnalyticsDashboardController {
    private final GetDashboardUseCase getDashboardUseCase;

    @GetMapping
    @PreAuthorize("hasAnyRole('OWNER','ADMIN')")
    @Operation(summary = "Получить dashboard-метрики")
    public DashboardResult getDashboard(
            @RequestParam(required = false) UUID storeId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant to
    ) {
        // Default to last 30 days if from/to not provided
        Instant start = (from != null) ? from : Instant.now().minus(java.time.Duration.ofDays(30));
        Instant end = (to != null) ? to : Instant.now();
        
        return getDashboardUseCase.getDashboard(storeId, start, end);
    }
}
