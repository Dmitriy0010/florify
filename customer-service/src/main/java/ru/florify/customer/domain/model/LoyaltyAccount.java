package ru.florify.customer.domain.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.With;
import ru.florify.customer.domain.enums.LoyaltyTier;
import ru.florify.customer.domain.exception.InsufficientPointsException;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;

/**
 * LoyaltyAccount — Rich Domain Object (RDO).
 * Contains logic for point reservation, confirmation, release, and tier upgrades.
 * No ordinal-based comparison for tiers; rank from config is used instead.
 */
@Getter
@Builder
@With
@AllArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class LoyaltyAccount {

    @EqualsAndHashCode.Include
    private final UUID id;

    private final UUID customerId;
    private final LoyaltyTier tier;
    private final int pointsBalance;
    private final int reservedPoints;    // Blocked points until order confirmation
    private final BigDecimal totalSpent;
    private final int version;
    private final Instant createdAt;
    private final Instant updatedAt;

    /** Available points for new reservation */
    public int availablePoints() {
        return pointsBalance - reservedPoints;
    }

    /** Reservation on order creation */
    public LoyaltyAccount reserve(int points, Instant now) {
        if (availablePoints() < points) {
            throw new InsufficientPointsException(
                "Available: %d, requested: %d".formatted(availablePoints(), points));
        }
        return this.withReservedPoints(this.reservedPoints + points).withUpdatedAt(now);
    }

    /**
     * Confirm on order completion:
     * release reserve + deduct from balance + add earned points
     */
    public LoyaltyAccount confirm(int pointsToDeduct, int pointsToEarn,
                                  BigDecimal purchaseAmount, Instant now) {
        return this
            .withPointsBalance(this.pointsBalance - pointsToDeduct + pointsToEarn)
            .withReservedPoints(this.reservedPoints - pointsToDeduct)
            .withTotalSpent(this.totalSpent.add(purchaseAmount))
            .withUpdatedAt(now);
    }

    /** Release reserve on order cancellation */
    public LoyaltyAccount release(int points, Instant now) {
        int newReserved = Math.max(0, this.reservedPoints - points);
        return this.withReservedPoints(newReserved).withUpdatedAt(now);
    }

    /**
     * Tier upgrade check.
     * Tier comparison via tierRank from config — never via ordinal().
     */
    public LoyaltyAccount upgradeTierIfNeeded(List<LoyaltyTierConfig> configs, Instant now) {
        int currentRank = configs.stream()
            .filter(c -> c.getTier() == this.tier)
            .mapToInt(LoyaltyTierConfig::getTierRank)
            .findFirst().orElse(0);

        return configs.stream()
            .filter(c -> this.totalSpent.compareTo(c.getMinSpend()) >= 0)
            .filter(c -> c.getTierRank() > currentRank)
            .max(Comparator.comparingInt(LoyaltyTierConfig::getTierRank))
            .map(c -> this.withTier(c.getTier()).withUpdatedAt(now))
            .orElse(this);
    }
}
