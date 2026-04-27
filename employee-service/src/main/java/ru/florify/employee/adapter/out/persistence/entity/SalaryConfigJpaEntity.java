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
import ru.florify.employee.domain.model.SalaryType;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Entity(name = "SalaryConfigEntity")
@Table(name = "employee_salary_configs")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class SalaryConfigJpaEntity {
    @Id
    @EqualsAndHashCode.Include
    private UUID id;
    private UUID employeeId;
    @Enumerated(EnumType.STRING)
    private SalaryType type;
    private BigDecimal baseAmount;
    private BigDecimal salesPercent;
    private BigDecimal bonusPerOrder;
    private LocalDate validFrom;
}
