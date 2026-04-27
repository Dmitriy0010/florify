package ru.florify.supplier.domain.exception;

import ru.florify.common.exception.DomainException;

public class InvalidInvoiceStatusException extends DomainException {
    public InvalidInvoiceStatusException(String message) {
        super("INVALID_INVOICE_STATUS", message);
    }
}
