package ru.florify.order.application.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.florify.order.application.port.in.GetOrderByIdUseCase;
import ru.florify.order.application.port.out.OrderRepository;
import ru.florify.order.domain.exception.OrderNotFoundException;
import ru.florify.order.domain.model.Order;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class GetOrderByIdInteractor implements GetOrderByIdUseCase {

    private final OrderRepository orderRepository;

    @Override
    @Transactional(readOnly = true)
    public Order execute(UUID id) {
        return orderRepository.findByIdWithItems(id)
                .orElseThrow(() -> new OrderNotFoundException(id));
    }
}
