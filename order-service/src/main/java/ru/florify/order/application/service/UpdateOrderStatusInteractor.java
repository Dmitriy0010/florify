package ru.florify.order.application.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.retry.annotation.Retryable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.florify.common.event.*;
import ru.florify.order.application.command.UpdateOrderStatusCommand;
import ru.florify.order.application.port.in.UpdateOrderStatusUseCase;
import ru.florify.order.application.port.out.OrderEventPublisher;
import ru.florify.order.application.port.out.OrderRepository;
import ru.florify.order.domain.event.OrderStatusChangedEvent;
import ru.florify.order.domain.exception.OrderNotFoundException;
import ru.florify.order.domain.model.Order;
import ru.florify.order.domain.model.OrderStatus;

import java.time.Clock;
import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class UpdateOrderStatusInteractor implements UpdateOrderStatusUseCase {

    private final OrderRepository orderRepository;
    private final OrderEventPublisher orderEventPublisher;
    private final ApplicationEventPublisher eventPublisher;
    private final Clock clock;

    @Override
    @Transactional
    @Retryable(maxAttempts = 3, retryFor = ObjectOptimisticLockingFailureException.class)
    public Order execute(UpdateOrderStatusCommand command) {
        log.info("Updating status for order {} to {}", command.orderId(), command.newStatus());
        Instant now = clock.instant();

        Order order = orderRepository.findByIdWithItems(command.orderId())
                .orElseThrow(() -> new OrderNotFoundException(command.orderId()));

        if (order.getStatus() == command.newStatus()) {
            log.info("Order {} already in status {}, skipping duplicate event", command.orderId(), command.newStatus());
            return order;
        }

        OrderStatus oldStatus = order.getStatus();

        // Business rule: PICKUP orders cannot be sent "out for delivery"
        if (command.newStatus() == OrderStatus.OUT_FOR_DELIVERY
                && order.getType() == ru.florify.order.domain.model.OrderType.PICKUP) {
            throw new ru.florify.order.domain.exception.InvalidOrderStatusTransitionException(
                "PICKUP orders cannot be set to OUT_FOR_DELIVERY. Use COMPLETED instead."
            );
        }

        // Apply status transition in domain (immutable update)
        if (command.newStatus() == OrderStatus.COMPLETED) {
            order = order.complete(command.floristId(), now);
        } else {
            order = order.transitionToStatus(command.newStatus(), now);
            if (command.floristId() != null) {
                order = order.toBuilder().floristId(command.floristId()).build();
            }
        }
        
        Order savedOrder = orderRepository.save(order);

        // Direct publish status-change event
        OrderStatusChangedEvent event = OrderStatusChangedEvent.of(
                savedOrder.getId(),
                oldStatus,
                command.newStatus(),
                now
        );

        orderEventPublisher.publish(
                "orders.order.status_changed",
                savedOrder.getId().toString(),
                event
        );

        // 2. Dedicated confirmation event (Triggers inventory write-off)
        if (command.newStatus() == OrderStatus.CONFIRMED) {
            List<OrderConfirmedEvent.OrderItem> eventItems = savedOrder.getItems().stream()
                    .map(item -> new OrderConfirmedEvent.OrderItem(
                            item.productId(),
                            item.quantity(),
                            item.unitPrice()
                    ))
                    .collect(Collectors.toList());

            orderEventPublisher.publish(
                    "orders.order.confirmed",
                    savedOrder.getId().toString(),
                    new OrderConfirmedEvent(
                            savedOrder.getId(),
                            savedOrder.getStoreId(),
                            command.floristId(),
                            eventItems
                    )
            );
        }

        // 3. Dedicated completion event
        if (command.newStatus() == OrderStatus.COMPLETED) {
            orderEventPublisher.publish(
                    "orders.order.completed",
                    savedOrder.getId().toString(),
                    OrderCompletedEvent.of(
                            savedOrder.getId(),
                            savedOrder.getCustomerId(),
                            savedOrder.getStoreId(),
                            savedOrder.getBonusPointsUsed(),
                            savedOrder.getFinalAmount(),
                            command.floristId(),
                            now
                    )
            );
            
            // Map items for the spring event (used by inventory and finance)
            List<ru.florify.common.event.OrderCompletedSpringEvent.ItemInfo> eventItems = savedOrder.getItems().stream()
                    .map(item -> new ru.florify.common.event.OrderCompletedSpringEvent.ItemInfo(
                            item.productId(),
                            item.quantity()
                    ))
                    .collect(Collectors.toList());

            // Spring Event для finance-service и customer-service (и теперь inventory)
            eventPublisher.publishEvent(
                    ru.florify.common.event.OrderCompletedSpringEvent.of(
                            savedOrder.getId(), 
                            savedOrder.getCustomerId(), 
                            savedOrder.getStoreId(),
                            savedOrder.getFinalAmount(), 
                            savedOrder.getTotalCogs(),
                            eventItems,
                            now
                    )
            );
        }

        // 4. Dedicated cancellation event
        if (command.newStatus() == OrderStatus.CANCELLED) {
            orderEventPublisher.publish(
                    "orders.order.cancelled",
                    savedOrder.getId().toString(),
                    OrderCancelledEvent.of(
                            savedOrder.getId(),
                            savedOrder.getCustomerId(),
                            savedOrder.getBonusPointsUsed(),
                            now
                    )
            );

            // Spring Event для delivery-service
            eventPublisher.publishEvent(
                    OrderCancelledSpringEvent.of(savedOrder.getId(), savedOrder.getCustomerId(), now)
            );
        }

        // 5. Spring Event при переводе заказа в READY (для подготовки доставки) или OUT_FOR_DELIVERY
        if (command.newStatus() == OrderStatus.READY || command.newStatus() == OrderStatus.OUT_FOR_DELIVERY) {
            eventPublisher.publishEvent(
                    OrderStatusChangedSpringEvent.of(
                            savedOrder.getId(),
                            oldStatus.name(),
                            command.newStatus().name(),
                            savedOrder.getDeliveryAddress(),
                            savedOrder.getType().name(),
                            savedOrder.getDeliverySlotId(),
                            savedOrder.getCustomerId(),
                            now
                    )
            );
        }

        return savedOrder;
    }
}
