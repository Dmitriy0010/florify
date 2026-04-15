package ru.florify.inventory.adapter.in.web.dto;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * Outbound DTO for stock balance.
 * Pure record, no validation (Domain layer ensures validity).
 */
public record StockBalanceResponse(
        UUID productId,
        BigDecimal quantityInStock,
        BigDecimal averageCost
) {}
