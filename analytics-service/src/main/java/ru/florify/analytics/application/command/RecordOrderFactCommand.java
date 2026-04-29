package ru.florify.analytics.application.command;

import ru.florify.analytics.domain.enums.OrderSource;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record RecordOrderFactCommand(
        UUID orderId,
        UUID storeId,
        UUID customerId,        // nullable
        UUID assignedEmployeeId, // nullable
        OrderSource orderSource,
        String status,
        BigDecimal totalAmount,
        Integer itemCount,
        Instant completedAt
) {
}
