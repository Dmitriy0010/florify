package ru.florify.customer.adapter.out.persistence.entity;

import jakarta.persistence.*;
import lombok.*;
import ru.florify.customer.domain.enums.LoyaltyTxType;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "loyalty_transactions")
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class LoyaltyTransactionJpaEntity {

    @Id
    @EqualsAndHashCode.Include
    private UUID id;

    private UUID loyaltyAccountId;
    private UUID orderId;

    @Enumerated(EnumType.STRING)
    private LoyaltyTxType type;

    private int points;
    private String description;
    private Instant occurredAt;
}
