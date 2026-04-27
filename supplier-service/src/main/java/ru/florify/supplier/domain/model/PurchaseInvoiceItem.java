package ru.florify.supplier.domain.model;

import lombok.Builder;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Builder(toBuilder = true)
public record PurchaseInvoiceItem(
        UUID id,
        UUID invoiceId,
        UUID productId,
        String productName,
        BigDecimal orderedQuantity,
        BigDecimal receivedQuantity,
        BigDecimal unitPrice,
        LocalDate expiresAt
) {
    public boolean isFullyReceived() {
        if (orderedQuantity == null || receivedQuantity == null) {
            return false;
        }
        return receivedQuantity.compareTo(orderedQuantity) >= 0;
    }

    public PurchaseInvoiceItem withReceivedQuantity(BigDecimal newReceivedQuantity) {
        return new PurchaseInvoiceItem(
                id,
                invoiceId,
                productId,
                productName,
                orderedQuantity,
                newReceivedQuantity,
                unitPrice,
                expiresAt
        );
    }
}
