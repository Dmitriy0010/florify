package ru.florify.supplier.adapter.in.web.dto;

import jakarta.validation.constraints.NotBlank;
import ru.florify.supplier.domain.model.PaymentTerms;

public record CreateSupplierRequest(
        @NotBlank String name,
        String contactPerson,
        String phone,
        String email,
        String address,
        String taxId,
        PaymentTerms paymentTerms,
        Integer rating,
        String notes
) {}
