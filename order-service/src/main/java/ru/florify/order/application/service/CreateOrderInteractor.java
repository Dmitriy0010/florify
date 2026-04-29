package ru.florify.order.application.service;

import lombok.RequiredArgsConstructor;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.retry.annotation.Retryable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.florify.common.event.OrderCreatedEvent;
import ru.florify.order.application.command.CreateOrderCommand;
import ru.florify.order.application.port.in.CreateOrderUseCase;
import ru.florify.order.application.port.out.OrderEventPublisher;
import ru.florify.order.application.port.out.OrderNumberGenerator;
import ru.florify.order.application.port.out.OrderRepository;
import ru.florify.order.domain.model.Order;

import java.math.BigDecimal;
import java.time.Clock;
import java.time.Instant;

@Service
@RequiredArgsConstructor
public class CreateOrderInteractor implements CreateOrderUseCase {

    private final OrderRepository orderRepository;
    private final OrderEventPublisher eventPublisher;
    private final OrderNumberGenerator orderNumberGenerator;
    private final org.springframework.context.ApplicationEventPublisher applicationEventPublisher;
    private final Clock clock;

    @Override
    @Transactional
    @Retryable(maxAttempts = 3, retryFor = ObjectOptimisticLockingFailureException.class)
    public Order execute(CreateOrderCommand command) {
        String orderNumber = orderNumberGenerator.next();

        Instant now = Instant.now(clock);

        Order order = Order.createNew(
                command.customerId(),
                command.guestPhone(),
                command.guestName(),
                orderNumber,
                command.idempotencyKey(),
                command.items(),
                command.bonusPointsUsed(),
                command.type(),
                command.source(),
                command.paymentMethod(),
                command.status(),
                command.deliveryAddress(),
                command.deliverySlotId(),
                command.deliveryZoneId(),
                command.storeId(), // storeId is 14th argument in Order.createNew
                now
        );
        Order savedOrder = orderRepository.save(order);

        int itemCount = savedOrder.getItems().stream()
                .map(item -> item.quantity().intValue())
                .reduce(0, Integer::sum);

        eventPublisher.publish(
                "orders.order.created",
                savedOrder.getId().toString(),  // Kafka key
                OrderCreatedEvent.of(
                        savedOrder.getId(),
                        savedOrder.getCustomerId(),
                        savedOrder.getStoreId(),
                        savedOrder.getBonusPointsUsed(),
                        savedOrder.getTotalAmount(),
                        itemCount,
                        savedOrder.getSource().name(),
                        now
                )
        );

        applicationEventPublisher.publishEvent(
                OrderCreatedEvent.of(
                        savedOrder.getId(),
                        savedOrder.getCustomerId(),
                        savedOrder.getStoreId(),
                        savedOrder.getBonusPointsUsed(),
                        savedOrder.getTotalAmount(),
                        itemCount,
                        savedOrder.getSource().name(),
                        now
                )
        );

        return savedOrder;
    }
}
