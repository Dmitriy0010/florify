package ru.florify.order.application.port.in;

import ru.florify.common.usecase.UseCase;
import ru.florify.order.domain.model.Order;

import java.util.List;
import java.util.UUID;

public interface GetOrdersByCustomerUseCase extends UseCase<UUID, List<Order>> {}
