package ru.florify.order.application.port.out;

import ru.florify.order.domain.model.Order;
import ru.florify.order.domain.model.OrderKanbanItem;
import ru.florify.order.domain.model.OrderStatus;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface OrderRepository {
    Order save(Order order);
    Optional<Order> findById(UUID id);
    Optional<Order> findByIdWithItems(UUID id);
    List<OrderKanbanItem> findKanbanByStatus(OrderStatus status, int limit);
    List<Order> findByCustomerId(UUID customerId);
    List<Order> findByFloristId(UUID floristId);
}
