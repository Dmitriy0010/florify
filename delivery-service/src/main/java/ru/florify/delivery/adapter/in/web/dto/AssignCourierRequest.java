package ru.florify.delivery.adapter.in.web.dto;

import jakarta.validation.constraints.NotNull;

import java.util.UUID;

/**
 * Запрос на назначение курьера на задачу доставки.
 */
public record AssignCourierRequest(
        @NotNull UUID courierId
) {}
