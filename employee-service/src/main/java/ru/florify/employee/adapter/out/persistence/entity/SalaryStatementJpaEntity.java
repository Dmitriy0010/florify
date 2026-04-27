package ru.florify.employee.adapter.out.persistence.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Version;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import ru.florify.employee.domain.model.PaymentStatus;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity(name = "SalaryStatementEntity")
@Table(name = "employee_salary_statements")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class SalaryStatementJpaEntity {
    @Id
    @EqualsAndHashCode.Include
    private UUID id;
    private UUID employeeId;
    private UUID storeId;
    private String period;
    private BigDecimal baseSalary;
    private BigDecimal salesBonus;
    private BigDecimal orderBonus;
    private BigDecimal manualBonus;
    private BigDecimal deductions;
    private BigDecimal totalPayout;
    @Enumerated(EnumType.STRING)
    private PaymentStatus status;
    private UUID approvedBy;
    private Instant paidAt;
}
