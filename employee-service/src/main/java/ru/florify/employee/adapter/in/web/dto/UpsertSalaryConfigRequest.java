package ru.florify.employee.adapter.in.web.dto;

import jakarta.validation.constraints.NotNull;
import ru.florify.employee.domain.model.SalaryType;

import java.math.BigDecimal;
import java.time.LocalDate;

public record UpsertSalaryConfigRequest(
        @NotNull SalaryType type,
        @NotNull BigDecimal baseAmount,
        @NotNull BigDecimal salesPercent,
        @NotNull BigDecimal bonusPerOrder,
        @NotNull LocalDate validFrom
) {
}
