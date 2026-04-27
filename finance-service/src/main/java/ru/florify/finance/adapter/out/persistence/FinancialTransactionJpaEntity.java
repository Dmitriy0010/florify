package ru.florify.finance.adapter.out.persistence;

import jakarta.persistence.*;
import lombok.*;
import ru.florify.finance.domain.model.FinancialType;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "financial_transactions")
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class FinancialTransactionJpaEntity {

    @Id
    private UUID id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private FinancialType type;

    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal amount;

    @Column(name = "reference_id", nullable = false)
    private UUID referenceId;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "performed_by")
    private UUID performedBy;

    @Column(name = "occurred_at", nullable = false)
    private Instant occurredAt;
}
