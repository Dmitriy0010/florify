package ru.florify.analytics.domain.model;

import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class PurchaseFact {
    @EqualsAndHashCode.Include
    private UUID id;
    private UUID invoiceId; // Unique for idempotency
    private UUID supplierId;
    private UUID storeId;
    private String supplierName;
    private BigDecimal totalAmount;
    private Integer itemCount;
    private Instant receivedAt;
    private Instant recordedAt;
}
