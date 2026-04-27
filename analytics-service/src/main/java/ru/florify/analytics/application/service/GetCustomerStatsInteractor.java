package ru.florify.analytics.application.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.florify.analytics.application.port.in.GetCustomerStatsUseCase;
import ru.florify.analytics.application.port.out.OrderFactRepository;
import ru.florify.analytics.application.result.CustomerStatsResult;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.time.temporal.TemporalAdjusters;

@Service
@RequiredArgsConstructor
public class GetCustomerStatsInteractor implements GetCustomerStatsUseCase {
    private final OrderFactRepository repository;

    @Override
    @Transactional(readOnly = true)
    public CustomerStatsResult getCustomerStats() {
        Instant monthStart = LocalDate.now().with(TemporalAdjusters.firstDayOfMonth()).atStartOfDay().toInstant(ZoneOffset.UTC);
        return repository.aggregateCustomerStats(monthStart);
    }
}
