package ru.florify.employee.adapter.in.web.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import ru.florify.employee.domain.model.EmployeeRole;

import java.time.LocalDate;
import java.util.UUID;

public record CreateEmployeeRequest(
        @NotNull UUID userId,
        UUID storeId,
        @NotBlank String firstName,
        @NotBlank String lastName,
        String phone,
        @NotNull EmployeeRole role,
        @NotNull LocalDate hireDate,
        String avatarUrl
) {
}
