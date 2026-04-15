package ru.florify.customer.application.command;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * Saga Step 2: Order completed -> confirm deduction + earn points.
 */
public record ConfirmPointsCommand(
    UUID customerId,
    UUID orderId,
    int pointsToDeduct,         // Equal to bonusPointsUsed in order
    BigDecimal purchaseAmount,  // For calculating earned points and tier upgrade
    UUID floristId,             // For potential future KPIs
    UUID eventId                // For idempotency
) {}
