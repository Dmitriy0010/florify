package ru.florify.customer.adapter.out.persistence.entity;

import jakarta.persistence.*;
import lombok.*;
import ru.florify.customer.domain.enums.LoyaltyTier;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "loyalty_accounts")
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class LoyaltyAccountJpaEntity {

    @Id
    @EqualsAndHashCode.Include
    private UUID id;

    private UUID customerId;

    @Enumerated(EnumType.STRING)
    private LoyaltyTier tier;

    private int pointsBalance;
    private int reservedPoints;
    private BigDecimal totalSpent;

    private Instant createdAt;
    private Instant updatedAt;
}
