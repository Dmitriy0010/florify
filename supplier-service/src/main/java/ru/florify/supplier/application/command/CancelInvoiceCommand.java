package ru.florify.supplier.application.command;

import java.util.UUID;

public record CancelInvoiceCommand(
        UUID invoiceId,
        String reason,
        UUID performerId
) {}
