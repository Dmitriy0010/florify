package ru.florify.customer.domain.enums;

import java.math.BigDecimal;

/**
 * Tier rules (previously in {@code loyalty_tier_configs}).
 */
public enum LoyaltyTier {
    BRONZE(1, BigDecimal.ZERO, 1, BigDecimal.ZERO),
    SILVER(2, new BigDecimal("10000"), 2, new BigDecimal("3")),
    GOLD(3, new BigDecimal("50000"), 3, new BigDecimal("5")),
    PLATINUM(4, new BigDecimal("200000"), 5, new BigDecimal("10"));

    private final int tierRank;
    private final BigDecimal minSpend;
    private final int pointsPerHundred;
    private final BigDecimal discountPercent;

    LoyaltyTier(int tierRank, BigDecimal minSpend, int pointsPerHundred, BigDecimal discountPercent) {
        this.tierRank = tierRank;
        this.minSpend = minSpend;
        this.pointsPerHundred = pointsPerHundred;
        this.discountPercent = discountPercent;
    }

    public int getTierRank() {
        return tierRank;
    }

    public BigDecimal getMinSpend() {
        return minSpend;
    }

    public int getPointsPerHundred() {
        return pointsPerHundred;
    }

    public BigDecimal getDiscountPercent() {
        return discountPercent;
    }
}
