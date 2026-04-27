package ru.florify.inventory.adapter.out.persistence.entity;

import jakarta.persistence.*;
import lombok.*;
import ru.florify.inventory.domain.model.TransactionType;
import ru.florify.inventory.domain.model.WriteOffReason;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(
    name = "stock_transactions",
    indexes = @Index(name = "idx_st_source_doc", columnList = "source_document_id", unique = false)
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class StockTransactionJpaEntity {
    @Id
    @EqualsAndHashCode.Include
    private UUID id;

    @Column(nullable = false)
    private UUID productId;

    @Column(nullable = false)
    private UUID storeId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TransactionType type;

    @Column(nullable = false)
    private BigDecimal quantity;

    @Column(nullable = false)
    private BigDecimal costBasis;

    @Column(nullable = false)
    private BigDecimal totalValue;

    @Enumerated(EnumType.STRING)
    private WriteOffReason writeOffReason;

    private String comment;

    @Column(nullable = false)
    private String sourceDocumentId;

    @Column(nullable = true)
    private UUID performerId;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;
}
