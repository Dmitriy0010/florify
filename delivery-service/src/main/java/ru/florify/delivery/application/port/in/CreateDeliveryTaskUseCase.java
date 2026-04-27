package ru.florify.delivery.application.port.in;

import ru.florify.delivery.application.command.CreateDeliveryTaskCommand;
import ru.florify.delivery.domain.model.DeliveryTask;

/**
 * Входной порт для создания задачи доставки.
 * Вызывается из REST (ручное создание ADMIN) и из Spring Event listener
 * (автоматически при переходе заказа в статус OUT_FOR_DELIVERY).
 */
public interface CreateDeliveryTaskUseCase {

    DeliveryTask execute(CreateDeliveryTaskCommand command);
}
