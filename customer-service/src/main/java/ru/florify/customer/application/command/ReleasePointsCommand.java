package ru.florify.customer.application.command;

import java.util.UUID;

/**
 * Saga Step 3: Order cancelled -> release reserve.
 */
public record ReleasePointsCommand(
    UUID customerId,
    UUID orderId,
    int pointsToRelease,
    UUID eventId                // For idempotency
) {}
