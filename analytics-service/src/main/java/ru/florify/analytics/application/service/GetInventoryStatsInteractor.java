package ru.florify.analytics.application.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.florify.analytics.application.port.in.GetInventoryStatsUseCase;
import ru.florify.analytics.application.port.out.WriteoffFactRepository;
import ru.florify.analytics.application.result.InventoryStatsResult;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.time.temporal.TemporalAdjusters;

@Service
@RequiredArgsConstructor
public class GetInventoryStatsInteractor implements GetInventoryStatsUseCase {
    private final WriteoffFactRepository repository;

    @Override
    @Transactional(readOnly = true)
    public InventoryStatsResult getInventoryStats() {
        Instant monthStart = LocalDate.now().with(TemporalAdjusters.firstDayOfMonth()).atStartOfDay().toInstant(ZoneOffset.UTC);
        return repository.aggregateInventoryStats(monthStart);
    }
}
