package ru.florify.order.domain.event;

import ru.florify.common.domain.event.DomainEvent;
import ru.florify.order.domain.model.Order;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record OrderCancelledEvent(
        UUID eventId,
        UUID orderId,
        UUID customerId,
        int bonusPointsUsed,
        Instant occurredAt
) implements DomainEvent {

    public static OrderCancelledEvent from(Order order, Instant now) {
        return new OrderCancelledEvent(
                UUID.randomUUID(),
                order.getId(),
                order.getCustomerId(),
                order.getBonusPointsUsed(),
                now
        );
    }
}
