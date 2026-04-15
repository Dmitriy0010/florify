package ru.florify.order.adapter.in.web.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record OrderKanbanResponse(
        UUID id,
        String orderNumber,
        String status,
        BigDecimal finalAmount,
        Instant createdAt
) {
}
