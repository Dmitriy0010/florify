package ru.florify.supplier.domain.event;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record InvoiceReceivedEvent(
        UUID eventId,
        UUID invoiceId,
        UUID supplierId,
        UUID storeId,
        List<Item> items,
        Instant occurredAt
) {
    public record Item(
            UUID productId,
            BigDecimal quantity,
            BigDecimal purchasePrice,
            java.time.LocalDate expiresAt
    ) {}

    public static InvoiceReceivedEvent of(
            UUID invoiceId,
            UUID supplierId,
            UUID storeId,
            List<ru.florify.supplier.domain.model.PurchaseInvoiceItem> items,
            Instant now
    ) {
        List<Item> payloadItems = items.stream()
                .map(i -> new Item(i.productId(), i.receivedQuantity(), i.unitPrice(), i.expiresAt()))
                .toList();
        return new InvoiceReceivedEvent(
                UUID.randomUUID(),
                invoiceId,
                supplierId,
                storeId,
                payloadItems,
                now
        );
    }
}
