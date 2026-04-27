package ru.florify.supplier.domain.exception;

import ru.florify.common.exception.NotFoundException;

import java.util.UUID;

public class InvoiceNotFoundException extends NotFoundException {
    public InvoiceNotFoundException(UUID invoiceId) {
        super("PurchaseInvoice", invoiceId);
    }
}
