package ru.florify.order.adapter.in.web.dto;

import jakarta.validation.constraints.NotNull;
import ru.florify.order.domain.model.OrderStatus;

import java.util.UUID;

public record UpdateOrderStatusRequest(
        @NotNull(message = "New status is required")
        OrderStatus status,
        UUID floristId
) {
}
