package ru.florify.supplier.application.command;

import java.util.UUID;

public record SubmitInvoiceCommand(
        UUID invoiceId,
        UUID performerId
) {}
