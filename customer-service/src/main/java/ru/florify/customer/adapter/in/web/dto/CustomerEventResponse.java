package ru.florify.customer.adapter.in.web.dto;

import ru.florify.customer.domain.enums.EventType;

import java.time.Instant;
import java.util.UUID;

public record CustomerEventResponse(
    UUID id,
    UUID customerId,
    UUID performerId,
    EventType type,
    String content,
    Instant occurredAt
) {}
