package ru.florify.employee.domain.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Getter
@Setter
@Builder(toBuilder = true)
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class SalaryConfig {
    @EqualsAndHashCode.Include
    private UUID id;
    private UUID employeeId;
    private SalaryType type;
    private BigDecimal baseAmount;
    private BigDecimal salesPercent;
    private BigDecimal bonusPerOrder;
    private LocalDate validFrom;
}
