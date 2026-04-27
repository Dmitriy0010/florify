package ru.florify.employee.adapter.in.web.dto;

import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record TimesheetActionRequest(
        @NotNull UUID employeeId
) {
}
