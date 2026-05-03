package ru.florify.customer.domain.model;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import ru.florify.customer.domain.enums.LoyaltyTier;
import ru.florify.customer.domain.exception.InsufficientPointsException;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class LoyaltyAccountTest {

    @Test
    @DisplayName("Should reserve points successfully")
    void shouldReservePoints() {
        // given
        LoyaltyAccount account = createBaseAccount().withPointsBalance(100);
        Instant now = Instant.now();

        // when
        LoyaltyAccount result = account.reserve(30, now);

        // then
        assertThat(result.getReservedPoints()).isEqualTo(30);
        assertThat(result.availablePoints()).isEqualTo(70);
        assertThat(result.getUpdatedAt()).isEqualTo(now);
    }

    @Test
    @DisplayName("Should throw exception when reserving more than available points")
    void shouldThrowWhenInsufficientPoints() {
        // given
        LoyaltyAccount account = createBaseAccount().withPointsBalance(50);
        Instant now = Instant.now();

        // when & then
        assertThatThrownBy(() -> account.reserve(60, now))
            .isInstanceOf(InsufficientPointsException.class)
            .hasMessageContaining("Available: 50, requested: 60");
    }

    @Test
    @DisplayName("Should confirm points deduction and earn new points")
    void shouldConfirmOrder() {
        // given
        LoyaltyAccount account = createBaseAccount()
            .withPointsBalance(100)
            .withReservedPoints(30)
            .withTotalSpent(new BigDecimal("1000.00"));
        Instant now = Instant.now();

        // when (deduct 30, earn 50, amount 500)
        LoyaltyAccount result = account.confirm(30, 50, new BigDecimal("500.00"), now);

        // then
        assertThat(result.getPointsBalance()).isEqualTo(120); // 100 - 30 + 50
        assertThat(result.getReservedPoints()).isEqualTo(0);
        assertThat(result.getTotalSpent()).isEqualByComparingTo("1500.00");
    }

    @Test
    @DisplayName("Should release reserved points")
    void shouldReleasePoints() {
        // given
        LoyaltyAccount account = createBaseAccount().withReservedPoints(30);
        Instant now = Instant.now();

        // when
        LoyaltyAccount result = account.release(30, now);

        // then
        assertThat(result.getReservedPoints()).isEqualTo(0);
    }

    @Test
    @DisplayName("Should upgrade tier based on built-in thresholds")
    void shouldUpgradeTier() {
        // given
        LoyaltyAccount account = createBaseAccount()
            .withTier(LoyaltyTier.BRONZE)
            .withTotalSpent(new BigDecimal("15000.00")); // Silver > 10000
        
        Instant now = Instant.now();

        // when
        LoyaltyAccount result = account.upgradeTierIfNeeded(now);

        // then
        assertThat(result.getTier()).isEqualTo(LoyaltyTier.SILVER);
        assertThat(result.getUpdatedAt()).isEqualTo(now);
    }

    @Test
    @DisplayName("Should not downgrade tier if spend drops")
    void shouldNotDowngradeTier() {
        // given
        LoyaltyAccount account = createBaseAccount()
            .withTier(LoyaltyTier.GOLD)
            .withTotalSpent(new BigDecimal("100.00")); // Low spend but already Gold
        
        // when
        LoyaltyAccount result = account.upgradeTierIfNeeded(Instant.now());

        // then
        assertThat(result.getTier()).isEqualTo(LoyaltyTier.GOLD);
    }

    private LoyaltyAccount createBaseAccount() {
        return LoyaltyAccount.builder()
            .id(UUID.randomUUID())
            .customerId(UUID.randomUUID())
            .tier(LoyaltyTier.BRONZE)
            .pointsBalance(0)
            .reservedPoints(0)
            .totalSpent(BigDecimal.ZERO)
            
            .createdAt(Instant.now())
            .updatedAt(Instant.now())
            .build();
    }
}
