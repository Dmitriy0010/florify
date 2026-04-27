package ru.florify.order.application.port.in;

import ru.florify.common.usecase.UseCase;
import ru.florify.order.application.command.CreateOrderCommand;
import ru.florify.order.domain.model.Order;

/**
 * Use case for orchestrating new order creation.
 * Coordinates input validation, inventory reservation, price calculation,
 * and initial order state persistence.
 */
public interface CreateOrderUseCase extends UseCase<CreateOrderCommand, Order> {
}
