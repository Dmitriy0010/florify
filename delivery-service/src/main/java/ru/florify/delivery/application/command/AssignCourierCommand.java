package ru.florify.delivery.application.command;

import java.util.UUID;

/**
 * Команда назначения курьера на задачу доставки.
 */
public record AssignCourierCommand(
        UUID taskId,
        UUID courierId,
        UUID performerId
) {}
