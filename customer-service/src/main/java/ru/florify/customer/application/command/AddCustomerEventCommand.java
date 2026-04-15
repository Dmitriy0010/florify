package ru.florify.customer.application.command;

import ru.florify.customer.domain.enums.EventType;
import java.util.UUID;

public record AddCustomerEventCommand(
    UUID customerId,
    UUID performerId,           // ONLY from JWT principal, never from request body
    EventType type,
    String content
) {}
