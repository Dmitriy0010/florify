package ru.florify.order.application.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.florify.order.application.port.in.GetOrdersKanbanUseCase;
import ru.florify.order.application.port.out.OrderRepository;
import ru.florify.order.domain.model.OrderKanbanItem;
import ru.florify.order.domain.model.OrderStatus;

import java.util.List;

@Service
@RequiredArgsConstructor
public class GetOrdersKanbanInteractor implements GetOrdersKanbanUseCase {

    private final OrderRepository orderRepository;

    @Override
    @Transactional(readOnly = true)
    public List<OrderKanbanItem> execute(OrderStatus status, int limit) {
        return orderRepository.findKanbanByStatus(status, limit);
    }
}
