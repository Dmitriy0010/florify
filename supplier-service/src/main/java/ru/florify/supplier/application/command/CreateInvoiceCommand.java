package ru.florify.supplier.application.command;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record CreateInvoiceCommand(
        UUID supplierId,
        UUID storeId,
        String invoiceNumber,
        Instant plannedDeliveryAt,
        String comment,
        UUID performerId,
        List<CreateInvoiceItemCommand> items
) {}
