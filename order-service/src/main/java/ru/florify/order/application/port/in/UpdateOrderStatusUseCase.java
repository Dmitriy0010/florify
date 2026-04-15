package ru.florify.order.application.port.in;

import ru.florify.common.usecase.UseCase;
import ru.florify.order.application.command.UpdateOrderStatusCommand;
import ru.florify.order.domain.model.Order;

public interface UpdateOrderStatusUseCase extends UseCase<UpdateOrderStatusCommand, Order> {
}
