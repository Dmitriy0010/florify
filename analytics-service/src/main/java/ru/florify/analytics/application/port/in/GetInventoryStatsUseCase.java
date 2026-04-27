package ru.florify.analytics.application.port.in;

import ru.florify.analytics.application.result.InventoryStatsResult;

public interface GetInventoryStatsUseCase {
    InventoryStatsResult getInventoryStats();
}
