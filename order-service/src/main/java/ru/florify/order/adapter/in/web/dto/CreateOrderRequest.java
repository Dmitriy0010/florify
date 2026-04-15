package ru.florify.order.adapter.in.web.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import ru.florify.order.domain.model.OrderSource;
import ru.florify.order.domain.model.OrderType;
import ru.florify.order.domain.model.PaymentMethod;

import java.math.BigDecimal;
import java.util.List;

public record CreateOrderRequest(
        @NotEmpty
        List<OrderItemDto> items,
        
        BigDecimal bonusPointsUsed,

        String guestPhone,
        String guestName,

        @NotNull
        OrderType type,

        @NotNull
        OrderSource source,

        @NotNull
        PaymentMethod paymentMethod
) {
}
