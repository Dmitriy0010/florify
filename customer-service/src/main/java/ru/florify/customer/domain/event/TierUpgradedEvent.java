package ru.florify.customer.domain.event;

import ru.florify.common.domain.event.DomainEvent;
import java.time.Instant;
import java.util.UUID;

public record TierUpgradedEvent(
    UUID eventId,
    UUID customerId,
    String previousTier,
    String newTier,
    Instant occurredAt
) implements DomainEvent {
}
