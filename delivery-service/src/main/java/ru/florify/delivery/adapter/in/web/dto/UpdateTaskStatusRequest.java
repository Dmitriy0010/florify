package ru.florify.delivery.adapter.in.web.dto;

import jakarta.validation.constraints.NotNull;
import ru.florify.delivery.domain.model.TaskStatus;

/**
 * Запрос на обновление статуса задачи доставки.
 *
 * failureReason обязателен при newStatus = FAILED.
 * Валидация выполняется в контроллере перед вызовом UseCase.
 */
public record UpdateTaskStatusRequest(
        @NotNull TaskStatus newStatus,
        String failureReason
) {}
