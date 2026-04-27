package ru.florify.analytics.application.port.out;

import ru.florify.analytics.application.result.InventoryStatsResult;
import ru.florify.analytics.domain.model.WriteoffFact;

import java.time.Instant;
import java.util.UUID;

public interface WriteoffFactRepository {
    void save(WriteoffFact fact);
    boolean existsBySourceEventId(UUID sourceEventId);
    InventoryStatsResult aggregateInventoryStats(Instant monthStart);
}
