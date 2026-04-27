package ru.florify.supplier.adapter.in.web.dto;

import java.util.UUID;

public record SupplierSummaryResponse(
        UUID id,
        String name,
        String phone,
        String email,
        boolean active
) {}
