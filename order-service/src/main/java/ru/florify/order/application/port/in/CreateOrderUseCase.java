package ru.florify.order.application.port.in;

import ru.florify.common.usecase.UseCase;
import ru.florify.order.application.command.CreateOrderCommand;
import ru.florify.order.domain.model.Order;

/**
 * Input port for creating a new order.
 */
public interface CreateOrderUseCase extends UseCase<CreateOrderCommand, Order> {
}
