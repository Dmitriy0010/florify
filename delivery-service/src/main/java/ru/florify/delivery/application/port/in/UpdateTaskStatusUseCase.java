package ru.florify.delivery.application.port.in;

import ru.florify.delivery.application.command.UpdateTaskStatusCommand;
import ru.florify.delivery.domain.model.DeliveryTask;

/**
 * Входной порт для обновления статуса задачи доставки.
 * Используется курьером (PICKED_UP, DELIVERED, FAILED) и администратором.
 */
public interface UpdateTaskStatusUseCase {

    DeliveryTask execute(UpdateTaskStatusCommand command);
}
