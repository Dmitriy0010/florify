package ru.florify.analytics.application.command;

import ru.florify.analytics.domain.enums.WriteoffReason;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record RecordWriteoffFactCommand(
        UUID sourceEventId,
        UUID productId,
        UUID storeId,
        String productName,
        UUID categoryId,
        String categoryName,
        BigDecimal quantity,
        WriteoffReason reason,
        Instant writtenOffAt
) {}
