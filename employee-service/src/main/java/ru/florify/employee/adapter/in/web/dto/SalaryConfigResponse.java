package ru.florify.employee.adapter.in.web.dto;

import ru.florify.employee.domain.model.SalaryType;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record SalaryConfigResponse(
        UUID id,
        UUID employeeId,
        SalaryType type,
        BigDecimal baseAmount,
        BigDecimal salesPercent,
        BigDecimal bonusPerOrder,
        LocalDate validFrom
) {
}
