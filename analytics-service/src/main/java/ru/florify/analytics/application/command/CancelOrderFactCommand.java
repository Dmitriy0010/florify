package ru.florify.analytics.application.command;

import java.time.Instant;
import java.util.UUID;

public record CancelOrderFactCommand(UUID orderId, String cancellationReason, Instant cancelledAt) {
}
