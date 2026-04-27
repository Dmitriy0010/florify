package ru.florify.order.adapter.in.web.dto;

import ru.florify.order.domain.model.OrderSource;
import ru.florify.order.domain.model.OrderType;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record OrderKanbanResponse(
        UUID id,
        String orderNumber,
        String status,
        BigDecimal finalAmount,
        Instant createdAt,
        String guestName,
        String guestPhone,
        OrderType type,
        OrderSource source,
        String floristName,
        Boolean isPaid
) {
}
