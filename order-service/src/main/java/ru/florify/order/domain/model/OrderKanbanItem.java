package ru.florify.order.domain.model;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

/**
 * Simplified projection for the Kanban board view.
 */
public record OrderKanbanItem(
        UUID id,
        String orderNumber,
        String status,
        BigDecimal finalAmount,
        Instant createdAt
) {
}
