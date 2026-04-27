package ru.florify.analytics.application.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.florify.analytics.application.port.in.GetSalesReportUseCase;
import ru.florify.analytics.application.port.out.AnalyticsCachePort;
import ru.florify.analytics.application.port.out.OrderFactRepository;
import ru.florify.analytics.application.query.SalesReportQuery;
import ru.florify.analytics.application.result.SalesReportResult;

import java.time.Duration;

@Service
@RequiredArgsConstructor
public class GetSalesReportInteractor implements GetSalesReportUseCase {
    private final OrderFactRepository repository;
    private final AnalyticsCachePort cachePort;

    @Override
    @Transactional(readOnly = true)
    public SalesReportResult getSalesReport(SalesReportQuery query) {
        String cacheKey = "sales-report-" + query.from() + "-" + query.to() + "-" + query.groupBy();
        return cachePort.getCachedSalesReport(cacheKey).orElseGet(() -> {
            SalesReportResult result = repository.aggregateSalesReport(query.from(), query.to(), query.groupBy());
            cachePort.cacheSalesReport(cacheKey, result, Duration.ofHours(1));
            return result;
        });
    }
}
