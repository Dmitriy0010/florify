package ru.florify.customer.domain.model;

import ru.florify.customer.domain.enums.EventType;
import java.time.Instant;
import java.util.UUID;

/**
 * CustomerEvent — CRM feed record, append-only.
 */
public record CustomerEvent(
    UUID id,
    UUID customerId,
    UUID performerId,           // Strictly from JWT principal, never from request body
    EventType type,
    String content,
    Instant occurredAt
) {}
