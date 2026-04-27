package ru.florify.analytics.application.port.in;

import java.time.Instant;
import java.util.UUID;
import ru.florify.analytics.application.result.DashboardResult;

public interface GetDashboardUseCase {
    DashboardResult getDashboard(UUID storeId, Instant from, Instant to);
}
