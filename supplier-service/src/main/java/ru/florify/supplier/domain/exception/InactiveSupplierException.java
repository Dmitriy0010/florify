package ru.florify.supplier.domain.exception;

import ru.florify.common.exception.DomainException;

import java.util.UUID;

/**
 * Thrown when invoice creation is attempted for inactive supplier.
 */
public class InactiveSupplierException extends DomainException {
    public InactiveSupplierException(UUID supplierId) {
        super("INACTIVE_SUPPLIER", "Cannot create invoice for inactive supplier: " + supplierId);
    }
}
