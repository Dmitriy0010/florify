package ru.florify.customer.domain.event;

import java.time.Instant;
import java.util.UUID;

public record BirthdayAlertEvent(
    UUID eventId,
    UUID customerId,
    String phone,
    String firstName,
    Instant occurredAt
) {}
