package ru.florify.supplier.application.command;

import ru.florify.supplier.domain.model.PaymentTerms;

import java.util.UUID;

public record UpdateSupplierCommand(
        UUID supplierId,
        String name,
        String contactPerson,
        String phone,
        String email,
        String address,
        String taxId,
        PaymentTerms paymentTerms,
        Integer rating,
        String notes
) {}
