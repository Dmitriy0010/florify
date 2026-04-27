package ru.florify.analytics.domain.model;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class SalaryFact {
    @EqualsAndHashCode.Include
    private UUID id;
    private UUID sourceEventId; // Unique for idempotency
    private UUID employeeId;
    private UUID storeId;
    private String employeeName;
    private String employeeRole;
    private BigDecimal amount;
    private LocalDate periodStart;
    private LocalDate periodEnd;
    private Instant paidAt;
    private Instant recordedAt;
}
