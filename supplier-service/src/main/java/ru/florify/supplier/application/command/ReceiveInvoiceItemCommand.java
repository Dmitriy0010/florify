package ru.florify.supplier.application.command;

import java.math.BigDecimal;
import java.util.UUID;

public record ReceiveInvoiceItemCommand(
        UUID itemId,
        BigDecimal receivedQuantity
) {}
