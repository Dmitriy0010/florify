package ru.florify.order.adapter.out.persistence.repository;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

/**
 * Spring Data Projection for Kanban board items.
 */
public interface OrderKanbanProjection {
    UUID getId();
    String getOrderNumber();
    String getStatus();
    BigDecimal getFinalAmount();
    Instant getCreatedAt();
    String getGuestName();
    String getGuestPhone();
    String getType();
    String getSource();
    default String getFloristName() { return "Олеся"; }
    Boolean getIsPaid();
}
