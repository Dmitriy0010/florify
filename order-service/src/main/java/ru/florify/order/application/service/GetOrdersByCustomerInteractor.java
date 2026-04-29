package ru.florify.order.application.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.florify.order.application.port.in.GetOrdersByCustomerUseCase;
import ru.florify.order.application.port.out.OrderRepository;
import ru.florify.order.domain.model.Order;

import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class GetOrdersByCustomerInteractor implements GetOrdersByCustomerUseCase {

    private final OrderRepository orderRepository;

    @Override
    @Transactional(readOnly = true)
    public List<Order> execute(UUID customerId) {
        log.debug("Fetching orders for customer {}", customerId);
        return orderRepository.findByCustomerId(customerId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Order> executeByFlorist(UUID floristId) {
        log.debug("Fetching orders for florist {}", floristId);
        return orderRepository.findByFloristId(floristId);
    }
    @Override
    @Transactional(readOnly = true)
    public List<Order> executeRecent(int limit) {
        log.debug("Fetching {} most recent orders", limit);
        return orderRepository.findRecent(limit);
    }
}
