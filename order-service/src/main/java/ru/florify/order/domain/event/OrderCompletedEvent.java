package ru.florify.order.domain.event;

import ru.florify.common.domain.event.DomainEvent;
import ru.florify.order.domain.model.Order;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record OrderCompletedEvent(
        UUID eventId,
        UUID orderId,
        String orderNumber,
        UUID customerId,
        BigDecimal finalAmount,
        int bonusPointsUsed,   // New field
        UUID floristId,
        Instant occurredAt
) implements DomainEvent {

    public static OrderCompletedEvent from(Order order, UUID floristId, Instant now) {
        return new OrderCompletedEvent(
                UUID.randomUUID(),
                order.getId(),
                order.getOrderNumber(),
                order.getCustomerId(),
                order.getFinalAmount(),
                order.getBonusPointsUsed(),
                floristId,
                now
        );
    }
}
