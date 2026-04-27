package ru.florify.common.event;

import java.time.Instant;
import java.util.UUID;

public record BirthdayAlertEvent(
    UUID customerId,
    String phone,
    String firstName,
    Instant occurredAt
) {}
