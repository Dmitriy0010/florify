package ru.florify.supplier.application.port.in;

import ru.florify.common.application.query.PagedResult;
import ru.florify.supplier.domain.model.InvoiceStatus;
import ru.florify.supplier.domain.model.PurchaseInvoice;

import java.time.Instant;
import java.util.UUID;

public interface GetInvoicesUseCase {
    PagedResult<PurchaseInvoice> execute(UUID supplierId, InvoiceStatus status, Instant from, Instant to, int page, int size);
}
