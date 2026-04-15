package ru.florify.customer.application.command;

import java.util.UUID;

public record LinkUserToCustomerCommand(
    UUID customerId,
    UUID userId
) {}
