package ru.florify.common.event;

import ru.florify.common.domain.event.DomainEvent;
import java.time.Instant;
import java.util.UUID;

public record TierUpgradedEvent(
    UUID customerId,
    String previousTier,
    String newTier,
    Instant occurredAt
) implements DomainEvent {
}
