package ru.florify.analytics.adapter.in.web;

import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import ru.florify.analytics.application.port.in.GetInventoryStatsUseCase;
import ru.florify.analytics.application.result.InventoryStatsResult;

@RestController
@RequestMapping("/api/v1/analytics/inventory")
@RequiredArgsConstructor
@Tag(name = "Analytics Inventory", description = "Складская аналитика")
public class AnalyticsInventoryController {
    private final GetInventoryStatsUseCase getInventoryStatsUseCase;

    @GetMapping("/stats")
    @PreAuthorize("hasAnyRole('OWNER','ADMIN','SUPPLIER_MANAGER')")
    public InventoryStatsResult getInventoryStats() {
        return getInventoryStatsUseCase.getInventoryStats();
    }
}
