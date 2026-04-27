package ru.florify.common.event;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.YearMonth;
import java.util.UUID;

public record SalaryPaidEvent(
        UUID statementId,
        UUID employeeId,
        UUID storeId,
        YearMonth period,
        BigDecimal totalPayout,
        Instant paidAt
) {
}
