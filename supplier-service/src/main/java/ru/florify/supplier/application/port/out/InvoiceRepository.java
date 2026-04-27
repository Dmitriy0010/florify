package ru.florify.supplier.application.port.out;

import ru.florify.common.application.query.PagedResult;
import ru.florify.supplier.domain.model.InvoiceStatus;
import ru.florify.supplier.domain.model.PurchaseInvoice;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

public interface InvoiceRepository {
    PurchaseInvoice save(PurchaseInvoice invoice);
    Optional<PurchaseInvoice> findById(UUID id);
    Optional<PurchaseInvoice> findByIdWithItems(UUID id);
    PagedResult<PurchaseInvoice> findAll(UUID supplierId, InvoiceStatus status, Instant from, Instant to, int page, int size);
    boolean existsBySupplierIdAndInvoiceNumber(UUID supplierId, String invoiceNumber);
}
