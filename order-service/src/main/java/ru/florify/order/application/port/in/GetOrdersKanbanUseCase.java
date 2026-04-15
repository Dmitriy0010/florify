package ru.florify.order.application.port.in;

import ru.florify.order.domain.model.OrderKanbanItem;
import ru.florify.order.domain.model.OrderStatus;

import java.util.List;

public interface GetOrdersKanbanUseCase {
    List<OrderKanbanItem> execute(OrderStatus status, int limit);
}
