package ru.florify.employee.adapter.in.web.dto;

import ru.florify.employee.domain.model.PaymentStatus;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.YearMonth;
import java.util.UUID;

public record SalaryStatementResponse(
        UUID id,
        UUID employeeId,
        YearMonth period,
        BigDecimal baseSalary,
        BigDecimal salesBonus,
        BigDecimal orderBonus,
        BigDecimal manualBonus,
        BigDecimal deductions,
        BigDecimal totalPayout,
        PaymentStatus status,
        UUID approvedBy,
        Instant paidAt
) {
}
