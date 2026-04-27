package ru.florify.employee.adapter.in.web.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record CalculateSalaryRequest(
        @NotNull UUID employeeId,
        @NotBlank String period
) {
}
