package ru.florify.order.domain.event;

import ru.florify.common.domain.event.DomainEvent;
import ru.florify.order.domain.model.Order;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

/**
 * Domain event published when a new order is successfully created.
 */
public record OrderCreatedEvent(
        UUID eventId,
        UUID orderId,
        String orderNumber,
        UUID customerId,
        BigDecimal finalAmount,
        int bonusPointsUsed,   // New field
        Instant createdAt,
        Instant occurredAt
) implements DomainEvent {

    public static OrderCreatedEvent from(Order order, Instant occurredAt) {
        return new OrderCreatedEvent(
                UUID.randomUUID(),
                order.getId(),
                order.getOrderNumber(),
                order.getCustomerId(),
                order.getFinalAmount(),
                order.getBonusPointsUsed(),
                order.getCreatedAt(),
                occurredAt
        );
    }
}
