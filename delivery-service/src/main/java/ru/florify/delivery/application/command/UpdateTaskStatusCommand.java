package ru.florify.delivery.application.command;

import ru.florify.delivery.domain.model.TaskStatus;

import java.util.UUID;

/**
 * Команда обновления статуса задачи доставки.
 *
 * failureReason обязателен если newStatus == FAILED (валидация на уровне DTO).
 */
public record UpdateTaskStatusCommand(
        UUID taskId,
        TaskStatus newStatus,
        String failureReason,
        UUID performerId
) {}
