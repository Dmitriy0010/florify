package ru.florify.supplier.domain.event;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record InvoiceSubmittedEvent(
        UUID eventId,
        UUID invoiceId,
        String invoiceNumber,
        UUID supplierId,
        String supplierName,
        String supplierEmail,
        List<InvoiceItemData> items,
        BigDecimal totalAmount,
        Instant occurredAt
) {
    public record InvoiceItemData(
            String productName,
            BigDecimal quantity,
            String unit,
            BigDecimal unitPrice,
            BigDecimal totalLineAmount
    ) {}

    public static InvoiceSubmittedEvent of(
            UUID invoiceId, 
            String invoiceNumber,
            UUID supplierId, 
            String supplierName,
            String supplierEmail, 
            List<InvoiceItemData> items,
            BigDecimal totalAmount,
            Instant now
    ) {
        return new InvoiceSubmittedEvent(
                UUID.randomUUID(), 
                invoiceId, 
                invoiceNumber,
                supplierId, 
                supplierName,
                supplierEmail, 
                items,
                totalAmount,
                now
        );
    }
}
