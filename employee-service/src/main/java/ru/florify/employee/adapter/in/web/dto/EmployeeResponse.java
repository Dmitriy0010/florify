package ru.florify.employee.adapter.in.web.dto;

import ru.florify.employee.domain.model.EmployeeRole;

import java.time.LocalDate;
import java.util.UUID;

public record EmployeeResponse(
        UUID id,
        UUID userId,
        UUID storeId,
        String firstName,
        String lastName,
        String phone,
        EmployeeRole role,
        LocalDate hireDate,
        LocalDate dismissDate,
        boolean active,
        String avatarUrl
) {
}
