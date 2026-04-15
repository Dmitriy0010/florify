package ru.florify.order.application.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.retry.annotation.Retryable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.florify.order.application.command.UpdateOrderStatusCommand;
import ru.florify.order.application.outbox.OutboxEvent;
import ru.florify.order.application.port.in.UpdateOrderStatusUseCase;
import ru.florify.order.application.port.out.IdempotencyPort;
import ru.florify.order.application.port.out.OrderRepository;
import ru.florify.order.application.port.out.OutboxRepository;
import ru.florify.order.domain.event.OrderCancelledEvent;
import ru.florify.order.domain.event.OrderCompletedEvent;
import ru.florify.order.domain.event.OrderStatusChangedEvent;
import ru.florify.order.domain.exception.OrderNotFoundException;
import ru.florify.order.domain.model.Order;
import ru.florify.order.domain.model.OrderStatus;

import java.time.Clock;
import java.time.Instant;

@Slf4j
@Service
@RequiredArgsConstructor
public class UpdateOrderStatusInteractor implements UpdateOrderStatusUseCase {

    private final OrderRepository orderRepository;
    private final OutboxRepository outboxRepository;
    private final IdempotencyPort idempotencyPort;
    private final Clock clock;

    @Override
    @Transactional
    @Retryable(maxAttempts = 3, retryFor = ObjectOptimisticLockingFailureException.class)
    public Order execute(UpdateOrderStatusCommand command) {
        log.info("Updating status for order {} to {}", command.orderId(), command.newStatus());
        Instant now = clock.instant();

        // 1. Idempotency check: try to save event ID within the same transaction.
        // If it's a duplicate, a constraint violation will be thrown and transaction rolled back.
        idempotencyPort.saveProcessedEvent(command.eventId(), now);

        Order order = orderRepository.findById(command.orderId())
                .orElseThrow(() -> new OrderNotFoundException(command.orderId()));

        OrderStatus oldStatus = order.getStatus();
        
        // Apply status transition in domain (immutable update)
        if (command.newStatus() == OrderStatus.COMPLETED) {
            order = order.complete(command.floristId(), now);
        } else {
            order = order.transitionToStatus(command.newStatus(), now);
        }
        
        Order savedOrder = orderRepository.save(order);

        // Register Outbox event for the status change
        OrderStatusChangedEvent event = OrderStatusChangedEvent.of(
                savedOrder.getId(),
                oldStatus,
                command.newStatus(),
                now
        );
        
        outboxRepository.save(OutboxEvent.create(
                "orders.order.status_changed",
                savedOrder.getId().toString(),
                event,
                now
        ));

        // 2. Dedicated completion event
        if (command.newStatus() == OrderStatus.COMPLETED) {
            outboxRepository.save(OutboxEvent.create(
                    "orders.order.completed",
                    savedOrder.getId().toString(),
                    OrderCompletedEvent.from(savedOrder, command.floristId(), now),
                    now
            ));
        }

        // 3. Dedicated cancellation event
        if (command.newStatus() == OrderStatus.CANCELLED) {
            outboxRepository.save(OutboxEvent.create(
                    "orders.order.cancelled",
                    savedOrder.getId().toString(),
                    OrderCancelledEvent.from(savedOrder, now),
                    now
            ));
        }

        return savedOrder;
    }
}
