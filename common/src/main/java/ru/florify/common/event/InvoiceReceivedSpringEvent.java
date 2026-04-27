package ru.florify.common.event;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

/**
 * Оповещение о приемке накладной поставщика.
 * Публикуется модулем supplier-service.
 */
public record InvoiceReceivedSpringEvent(
        UUID invoiceId,
        UUID supplierId,
        UUID storeId,
        BigDecimal totalAmount,
        Instant occurredAt
) {
    public static InvoiceReceivedSpringEvent of(UUID invoiceId, UUID supplierId, UUID storeId, BigDecimal totalAmount, Instant now) {
        return new InvoiceReceivedSpringEvent(invoiceId, supplierId, storeId, totalAmount, now);
    }
}
