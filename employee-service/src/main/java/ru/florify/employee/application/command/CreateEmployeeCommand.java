package ru.florify.employee.application.command;

import ru.florify.employee.domain.model.EmployeeRole;

import java.time.LocalDate;
import java.util.UUID;

public record CreateEmployeeCommand(
        UUID userId,
        UUID storeId,
        String firstName,
        String lastName,
        String phone,
        EmployeeRole role,
        LocalDate hireDate,
        String avatarUrl
) {
}

