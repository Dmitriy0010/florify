package ru.florify.inventory.infrastructure.persistence.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "stock_balances", schema = "inventory")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StockBalanceJpaEntity {
    @Id
    private UUID id;

    @Column(nullable = false, unique = true)
    private UUID productId;

    @Column(nullable = false)
    private BigDecimal quantityInStock;

    @Column(nullable = false)
    private BigDecimal averageCost;

    @Version
    private Integer version;
}
