package ru.florify.auth.adapter.in.web.dto;

import jakarta.validation.constraints.NotNull;
import ru.florify.auth.domain.model.Role;

public record AssignRoleRequest(
        @NotNull(message = "Role is required")
        Role role
) {}
