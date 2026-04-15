package ru.florify.order.application.command;

import ru.florify.order.domain.model.OrderStatus;

import java.util.UUID;

public record UpdateOrderStatusCommand(
        UUID eventId,
        UUID orderId,
        OrderStatus newStatus,
        UUID floristId
) {
}
