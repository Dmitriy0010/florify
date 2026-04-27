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
import java.util.Arrays;
import java.util.Comparator;
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
    private final Instant createdAt;
    private final Instant updatedAt;

    /** Available points for new reservation */
    public int availablePoints() {
        return pointsBalance - reservedPoints;
    }

    /** Manual Earn Points */
    public LoyaltyAccount earnPoints(int points, Instant now) {
        return this.withPointsBalance(this.pointsBalance + points).withUpdatedAt(now);
    }

    /** Manual Withdraw Points */
    public LoyaltyAccount withdrawPoints(int points, Instant now) {
        if (this.pointsBalance < points) {
            throw new InsufficientPointsException("Balance: %d, requested: %d".formatted(this.pointsBalance, points));
        }
        return this.withPointsBalance(this.pointsBalance - points).withUpdatedAt(now);
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
     * Tier upgrade check using built-in tier thresholds (see {@link LoyaltyTier}).
     */
    public LoyaltyAccount upgradeTierIfNeeded(Instant now) {
        int currentRank = this.tier.getTierRank();

        return Arrays.stream(LoyaltyTier.values())
            .filter(t -> this.totalSpent.compareTo(t.getMinSpend()) >= 0)
            .filter(t -> t.getTierRank() > currentRank)
            .max(Comparator.comparingInt(LoyaltyTier::getTierRank))
            .map(t -> this.withTier(t).withUpdatedAt(now))
            .orElse(this);
    }
}
