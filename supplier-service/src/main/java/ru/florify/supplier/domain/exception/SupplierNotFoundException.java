package ru.florify.supplier.domain.exception;

import ru.florify.common.exception.NotFoundException;

import java.util.UUID;

public class SupplierNotFoundException extends NotFoundException {
    public SupplierNotFoundException(UUID supplierId) {
        super("Supplier", supplierId);
    }
}
