package ru.florify.analytics.application.command;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.Instant;
import java.util.UUID;

public record RecordSalaryFactCommand(
        UUID sourceEventId,
        UUID employeeId,
        UUID storeId,
        String employeeName,
        String employeeRole,
        BigDecimal amount,
        LocalDate periodStart,
        LocalDate periodEnd,
        Instant paidAt
) {}
