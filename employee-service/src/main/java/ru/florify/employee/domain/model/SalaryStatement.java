package ru.florify.employee.domain.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import ru.florify.employee.domain.exception.InvalidSalaryStateException;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.YearMonth;
import java.util.UUID;

@Getter
@Setter
@Builder(toBuilder = true)
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class SalaryStatement {
    @EqualsAndHashCode.Include
    private UUID id;
    private UUID employeeId;
    private UUID storeId;
    private YearMonth period;
    private BigDecimal baseSalary;
    private BigDecimal salesBonus;
    private BigDecimal orderBonus;
    private BigDecimal manualBonus;
    private BigDecimal deductions;
    private BigDecimal totalPayout;
    private PaymentStatus status;
    private UUID approvedBy;
    private Instant paidAt;

    public SalaryStatement approve(UUID performerId) {
        if (status != PaymentStatus.DRAFT) {
            throw new InvalidSalaryStateException("Only DRAFT statement can be approved");
        }
        return this.toBuilder()
                .status(PaymentStatus.APPROVED)
                .approvedBy(performerId)
                .build();
    }

    public SalaryStatement markPaid(Instant now) {
        if (status != PaymentStatus.APPROVED) {
            throw new InvalidSalaryStateException("Only APPROVED statement can be paid");
        }
        return this.toBuilder()
                .status(PaymentStatus.PAID)
                .paidAt(now)
                .build();
    }
}
