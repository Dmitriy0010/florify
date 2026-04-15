package ru.florify.customer.domain.event;

import ru.florify.common.domain.event.DomainEvent;
import ru.florify.customer.domain.model.Customer;
import java.time.Instant;
import java.util.UUID;

public record CustomerCreatedEvent(
    UUID eventId,
    UUID customerId,
    String phone,
    String email,
    UUID userId,
    String source,
    Instant occurredAt
) implements DomainEvent {
    public static CustomerCreatedEvent from(Customer c, Instant now) {
        return new CustomerCreatedEvent(
            UUID.randomUUID(),
            c.getId(),
            c.getPhone(),
            c.getEmail(),
            c.getUserId(),
            c.getSource().name(),
            now
        );
    }
}
