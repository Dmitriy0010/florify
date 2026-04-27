package ru.florify.supplier.application.port.in;

import ru.florify.supplier.application.command.UpdateInvoiceCommand;
import ru.florify.supplier.domain.model.PurchaseInvoice;

/**
 * Use case for updating an existing purchase invoice.
 * Only applicable while invoice is in DRAFT status.
 */
public interface UpdateInvoiceUseCase {
    PurchaseInvoice execute(UpdateInvoiceCommand command);
}
