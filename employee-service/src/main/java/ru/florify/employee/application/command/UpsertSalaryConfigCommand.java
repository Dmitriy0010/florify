package ru.florify.employee.application.command;

import ru.florify.employee.domain.model.SalaryType;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record UpsertSalaryConfigCommand(
        UUID employeeId,
        SalaryType type,
        BigDecimal baseAmount,
        BigDecimal salesPercent,
        BigDecimal bonusPerOrder,
        LocalDate validFrom
) {
}
