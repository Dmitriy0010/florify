package ru.florify.order.application.service;

import lombok.RequiredArgsConstructor;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.retry.annotation.Retryable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.florify.common.exception.DomainException;
import ru.florify.order.application.command.CreateOrderCommand;
import ru.florify.order.application.port.in.CreateOrderUseCase;
import ru.florify.order.application.port.out.OrderNumberGenerator;
import ru.florify.order.application.port.out.OrderRepository;
import ru.florify.order.application.port.out.OutboxRepository;
import ru.florify.order.application.outbox.OutboxEvent;
import ru.florify.order.domain.event.OrderCreatedEvent;
import ru.florify.order.domain.model.Order;

import java.math.BigDecimal;
import java.time.Clock;
import java.time.Instant;

@Service
@RequiredArgsConstructor
public class CreateOrderInteractor implements CreateOrderUseCase {

    private final OrderRepository orderRepository;
    private final OutboxRepository outboxRepository;
    private final OrderNumberGenerator orderNumberGenerator;
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
                now
        );
        Order savedOrder = orderRepository.save(order);

        OrderCreatedEvent event = OrderCreatedEvent.from(savedOrder, now);

        OutboxEvent outboxEvent = OutboxEvent.create(
                "orders.order.created",
                savedOrder.getId().toString(),  // Kafka key
                event,
                now
        );

        outboxRepository.save(outboxEvent);

        return savedOrder;
    }
}
