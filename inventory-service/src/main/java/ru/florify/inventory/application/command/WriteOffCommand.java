package ru.florify.inventory.application.command;

import ru.florify.inventory.domain.model.WriteOffReason;

import java.math.BigDecimal;
import java.util.UUID;

public record WriteOffCommand(
        UUID productId,
        UUID storeId,
        BigDecimal quantity,
        WriteOffReason reason,
        String comment,
        String sourceDocumentId, // Idempotency
        UUID performerId
) {}
