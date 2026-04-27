package ru.florify.supplier.adapter.in.web.dto;

import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;

public record ReceiveInvoiceRequest(
        UUID storeId,
        @Valid List<ReceiveInvoiceItemRequest> items
) {}
