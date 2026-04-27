package ru.florify.delivery.application.port.in;

import ru.florify.delivery.application.command.AssignCourierCommand;
import ru.florify.delivery.domain.model.DeliveryTask;

/**
 * Входной порт для назначения курьера на задачу доставки.
 */
public interface AssignCourierUseCase {

    DeliveryTask execute(AssignCourierCommand command);
}
