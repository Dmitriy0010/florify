package ru.florify.order.application.command;

import ru.florify.order.domain.model.OrderItem;
import ru.florify.order.domain.model.OrderSource;
import ru.florify.order.domain.model.OrderType;
import ru.florify.order.domain.model.PaymentMethod;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public record CreateOrderCommand(
        UUID customerId,
        UUID storeId,
        String guestPhone,
        String guestName,
        List<OrderItem> items,
        int bonusPointsUsed,
        OrderType type,
        OrderSource source,
        PaymentMethod paymentMethod,
        String idempotencyKey,
        String deliveryAddress,
        UUID deliverySlotId,
        UUID deliveryZoneId
) {
}
