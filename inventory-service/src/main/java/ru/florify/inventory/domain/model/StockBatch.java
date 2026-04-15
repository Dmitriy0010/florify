package ru.florify.inventory.domain.model;

import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Getter
@Builder
@With
@AllArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class StockBatch {

    @EqualsAndHashCode.Include
    private final UUID id;

    private final UUID productId;
    private final BigDecimal quantityReceived;
    private final BigDecimal quantityRemaining;
    private final BigDecimal unitCost;
    private final Instant receivedAt;
    private final Instant expiresAt;  // может быть null для неограниченных товаров
    private final BatchStatus status;
    private final String sourceDocumentId;
    private final Integer version;

    public boolean isExpired(Instant now) {
        return expiresAt != null && now.isAfter(expiresAt);
    }

    public boolean hasAvailableStock() {
        return quantityRemaining.compareTo(BigDecimal.ZERO) > 0 
                && status == BatchStatus.AVAILABLE;
    }

    public StockBatch writeOff(BigDecimal quantity) {
        if (quantity == null || quantity.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Quantity must be positive");
        }

        BigDecimal newRemaining = this.quantityRemaining.subtract(quantity);
        
        if (newRemaining.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("Insufficient stock in batch");
        }

        BatchStatus newStatus = newRemaining.compareTo(BigDecimal.ZERO) == 0 
                ? BatchStatus.DEPLETED 
                : BatchStatus.AVAILABLE;

        return this.withQuantityRemaining(newRemaining)
                .withStatus(newStatus);
    }
}
