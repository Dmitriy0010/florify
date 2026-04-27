package ru.florify.customer.adapter.in.web.dto;

import ru.florify.customer.domain.enums.LoyaltyTier;

import java.math.BigDecimal;

public record LoyaltyTierInfoResponse(
        String tier,
        int tierRank,
        BigDecimal minSpend,
        int pointsPerHundred,
        BigDecimal discountPercent
) {
    public static LoyaltyTierInfoResponse from(LoyaltyTier t) {
        return new LoyaltyTierInfoResponse(
                t.name(),
                t.getTierRank(),
                t.getMinSpend(),
                t.getPointsPerHundred(),
                t.getDiscountPercent()
        );
    }
}
