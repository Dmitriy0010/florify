package ru.florify.employee.application.command;

import java.math.BigDecimal;
import java.util.UUID;

public record AdjustSalaryCommand(
        UUID statementId,
        BigDecimal manualBonus,
        BigDecimal deductions
) {
}
