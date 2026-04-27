package ru.florify.analytics.adapter.in.web;

import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import ru.florify.analytics.application.port.in.GetCustomerStatsUseCase;
import ru.florify.analytics.application.result.CustomerStatsResult;

@RestController
@RequestMapping("/api/v1/analytics/customers")
@RequiredArgsConstructor
@Tag(name = "Analytics Customers", description = "Аналитика клиентов")
public class AnalyticsCustomersController {
    private final GetCustomerStatsUseCase getCustomerStatsUseCase;

    @GetMapping("/stats")
    @PreAuthorize("hasAnyRole('OWNER','ADMIN')")
    public CustomerStatsResult getCustomerStats() {
        return getCustomerStatsUseCase.getCustomerStats();
    }
}
