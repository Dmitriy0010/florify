package ru.florify.finance.domain.model;

import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

/**
 * Финансовая транзакция в Главной книге (General Ledger).
 * Агрегат доменного уровня.
 */
@Getter
@Builder(toBuilder = true)
@AllArgsConstructor
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class FinancialTransaction {
    private UUID id;
    private FinancialType type;
    private BigDecimal amount;
    private UUID referenceId; // Ссылка на заказ, накладную или ведомость
    private String description;
    private UUID performedBy;
    private Instant occurredAt;

    public static FinancialTransaction create(
            FinancialType type,
            BigDecimal amount,
            UUID referenceId,
            String description,
            UUID performedBy,
            Instant occurredAt
    ) {
        return FinancialTransaction.builder()
                .id(UUID.randomUUID())
                .type(type)
                .amount(amount)
                .referenceId(referenceId)
                .description(description)
                .performedBy(performedBy)
                .occurredAt(occurredAt)
                .build();
    }
}
