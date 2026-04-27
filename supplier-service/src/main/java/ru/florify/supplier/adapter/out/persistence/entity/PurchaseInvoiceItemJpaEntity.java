package ru.florify.supplier.adapter.out.persistence.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Entity(name = "PurchaseInvoiceItemEntity")
@Table(name = "purchase_invoice_items")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class PurchaseInvoiceItemJpaEntity {
    @Id
    @EqualsAndHashCode.Include
    private UUID id;
    @ManyToOne(fetch = jakarta.persistence.FetchType.LAZY)
    @jakarta.persistence.JoinColumn(name = "invoice_id", nullable = false)
    @ToString.Exclude
    private PurchaseInvoiceJpaEntity invoice;

    @Column(name = "invoice_id", insertable = false, updatable = false)
    private UUID invoiceId;
    private UUID productId;
    private String productName;
    private BigDecimal orderedQuantity;
    private BigDecimal receivedQuantity;
    private BigDecimal unitPrice;
    private LocalDate expiresAt;
}
