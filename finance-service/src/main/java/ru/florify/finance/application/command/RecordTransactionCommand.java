package ru.florify.finance.application.command;

import ru.florify.finance.domain.model.FinancialType;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record RecordTransactionCommand(
        FinancialType type,
        BigDecimal amount,
        UUID referenceId,
        String description,
        UUID performerId,
        Instant occurredAt
) {
}
