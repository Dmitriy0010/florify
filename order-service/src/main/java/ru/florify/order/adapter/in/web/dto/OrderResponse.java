package ru.florify.order.adapter.in.web.dto;

import ru.florify.order.domain.model.OrderSource;
import ru.florify.order.domain.model.OrderStatus;
import ru.florify.order.domain.model.OrderType;
import ru.florify.order.domain.model.PaymentMethod;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record OrderResponse(
        UUID id,
        String orderNumber,
        UUID customerId,
        OrderStatus status,
        List<OrderItemDto> items,
        BigDecimal totalAmount,
        BigDecimal discountAmount,
        BigDecimal bonusPointsUsed,
        BigDecimal finalAmount,
        OrderType type,
        OrderSource source,
        PaymentMethod paymentMethod,
        boolean isPaid,
        String deliveryAddress,
        UUID deliverySlotId,
        String guestPhone,
        String guestName,
        Instant createdAt,
        Instant updatedAt
) {
}
