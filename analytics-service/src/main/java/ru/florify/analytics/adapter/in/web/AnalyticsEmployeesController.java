package ru.florify.analytics.adapter.in.web;

import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import ru.florify.analytics.application.port.in.GetEmployeePerformanceUseCase;
import ru.florify.analytics.application.result.EmployeePerformanceResult;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/v1/analytics/employees")
@RequiredArgsConstructor
@Tag(name = "Analytics Employees", description = "Аналитика сотрудников")
public class AnalyticsEmployeesController {
    private final GetEmployeePerformanceUseCase getEmployeePerformanceUseCase;

    @GetMapping("/performance")
    @PreAuthorize("hasAnyRole('OWNER','ADMIN')")
    public EmployeePerformanceResult getEmployeePerformance(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to
    ) {
        return getEmployeePerformanceUseCase.getEmployeePerformance(from, to);
    }
}
