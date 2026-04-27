package ru.florify.customer.application.command;

import java.util.UUID;

/**
 * Saga Step 1: Reserve points on order creation.
 */
public record ReservePointsCommand(
    UUID customerId,
    UUID orderId,
    int pointsToReserve
) {}
