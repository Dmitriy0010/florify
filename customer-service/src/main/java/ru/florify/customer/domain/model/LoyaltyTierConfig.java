package ru.florify.customer.domain.model;

import lombok.*;
import ru.florify.customer.domain.enums.LoyaltyTier;
import java.math.BigDecimal;
import java.util.UUID;

/**
 * LoyaltyTierConfig — Rich Domain Object (Entity) for loyalty tier rules.
 * Uses version for optimistic locking.
 * According to manifesto, @Data is prohibited.
 */
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class LoyaltyTierConfig {

    @EqualsAndHashCode.Include
    private UUID id;

    private LoyaltyTier tier;
    private int tierRank;            // 1=BRONZE, 2=SILVER, 3=GOLD, 4=PLATINUM
    private BigDecimal minSpend;
    private int pointsPerHundred;    // Points per 100 RUB spent
    private BigDecimal discountPercent;
    private int version;
}
