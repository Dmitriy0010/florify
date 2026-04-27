package ru.florify.analytics.application.port.in;

import ru.florify.analytics.application.result.CustomerStatsResult;

public interface GetCustomerStatsUseCase {
    CustomerStatsResult getCustomerStats();
}
