package ru.florify.inventory.adapter.out.persistence.entity;

import jakarta.persistence.*;
import lombok.*;
import ru.florify.inventory.domain.model.BatchStatus;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "stock_batches")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class StockBatchJpaEntity {

    @Id
    @EqualsAndHashCode.Include
    private UUID id;

    @Column(name = "product_id", nullable = false)
    private UUID productId;

    @Column(name = "store_id", nullable = false)
    private UUID storeId;

    @Column(name = "supplier_id")
    private UUID supplierId;

    @Column(name = "quantity_received", nullable = false)
    private BigDecimal quantityReceived;

    @Column(name = "quantity_remaining", nullable = false)
    private BigDecimal quantityRemaining;

    @Column(name = "unit_cost", nullable = false)
    private BigDecimal unitCost;

    @Column(name = "received_at", nullable = false)
    private Instant receivedAt;

    @Column(name = "expires_at")
    private Instant expiresAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private BatchStatus status;

    @Column(name = "source_document_id", nullable = false, length = 100)
    private String sourceDocumentId;
}
