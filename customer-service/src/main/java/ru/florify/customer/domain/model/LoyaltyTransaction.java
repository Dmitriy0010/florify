package ru.florify.customer.domain.model;

import ru.florify.customer.domain.enums.LoyaltyTxType;
import java.time.Instant;
import java.util.UUID;

/**
 * LoyaltyTransaction — append-only record for tracking point movements.
 */
public record LoyaltyTransaction(
    UUID id,
    UUID loyaltyAccountId,
    UUID orderId,               // nullable
    LoyaltyTxType type,         // EARN, RESERVE, CONFIRM, RELEASE
    int points,
    String description,
    Instant occurredAt
) {}
