package ru.florify.customer.adapter.in.web.dto;

import ru.florify.customer.domain.enums.LoyaltyTier;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record LoyaltyAccountResponse(
    UUID id,
    UUID customerId,
    LoyaltyTier tier,
    int pointsBalance,
    int reservedPoints,
    int availablePoints,
    BigDecimal totalSpent,
    Instant updatedAt
) {}
