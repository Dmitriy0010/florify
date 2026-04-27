package ru.florify.supplier.application.command;

import java.util.List;
import java.util.UUID;

public record ReceiveInvoiceCommand(
        UUID invoiceId,
        UUID storeId,
        UUID performerId,
        List<ReceiveInvoiceItemCommand> items
) {}
