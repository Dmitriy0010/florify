package ru.florify.supplier.adapter.out.persistence.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity(name = "PurchaseInvoiceEntity")
@Table(name = "purchase_invoices")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class PurchaseInvoiceJpaEntity {
    @Id
    @EqualsAndHashCode.Include
    private UUID id;
    private String invoiceNumber;
    private UUID supplierId;
    private UUID storeId;
    private String supplierName;
    private String status;
    private BigDecimal totalAmount;
    private Instant plannedDeliveryAt;
    private Instant receivedAt;
    private String comment;
    private UUID createdBy;
    private Instant createdAt;

    @OneToMany(mappedBy = "invoice", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<PurchaseInvoiceItemJpaEntity> items = new ArrayList<>();

    public void setItems(List<PurchaseInvoiceItemJpaEntity> items) {
        this.items = items;
        if (items != null) {
            items.forEach(item -> item.setInvoice(this));
        }
    }
}
