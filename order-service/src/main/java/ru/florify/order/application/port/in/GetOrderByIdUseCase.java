package ru.florify.order.application.port.in;

import ru.florify.common.usecase.UseCase;
import ru.florify.order.domain.model.Order;

import java.util.UUID;

public interface GetOrderByIdUseCase extends UseCase<UUID, Order> {
}
