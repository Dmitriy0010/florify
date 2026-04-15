package ru.florify.order.domain.event;

import ru.florify.common.domain.event.DomainEvent;
import ru.florify.order.domain.model.OrderStatus;

import java.time.Instant;
import java.util.UUID;

public record OrderStatusChangedEvent(
        UUID eventId,
        UUID orderId,
        String oldStatus,
        String newStatus,
        Instant occurredAt
) implements DomainEvent {

    public static OrderStatusChangedEvent of(UUID orderId, OrderStatus oldStatus, OrderStatus newStatus, Instant occurredAt) {
        return new OrderStatusChangedEvent(
                UUID.randomUUID(),
                orderId,
                oldStatus.name(),
                newStatus.name(),
                occurredAt
        );
    }
}
