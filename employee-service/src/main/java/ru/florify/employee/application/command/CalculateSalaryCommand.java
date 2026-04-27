package ru.florify.employee.application.command;

import java.time.YearMonth;
import java.util.UUID;

public record CalculateSalaryCommand(
        UUID employeeId,
        YearMonth period
) {
}
