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
import ru.florify.analytics.application.port.in.GetTopProductsUseCase;
import ru.florify.analytics.application.query.TopProductsQuery;
import ru.florify.analytics.application.result.TopProductsResult;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/v1/analytics/products")
@RequiredArgsConstructor
@Tag(name = "Analytics Products", description = "Аналитика товаров")
public class AnalyticsProductsController {
    private final GetTopProductsUseCase getTopProductsUseCase;

    @GetMapping("/top")
    @PreAuthorize("hasAnyRole('OWNER','ADMIN')")
    @Operation(summary = "Получить топ товаров")
    public TopProductsResult getTopProducts(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(defaultValue = "10") int limit
    ) {
        return getTopProductsUseCase.getTopProducts(new TopProductsQuery(from, to, limit));
    }
}
