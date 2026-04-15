package ru.florify.customer.adapter.in.web.dto;

import ru.florify.customer.domain.enums.LoyaltyTxType;

import java.time.Instant;
import java.util.UUID;

public record LoyaltyTransactionResponse(
    UUID id,
    UUID orderId,
    LoyaltyTxType type,
    int points,
    String description,
    Instant occurredAt
) {}
