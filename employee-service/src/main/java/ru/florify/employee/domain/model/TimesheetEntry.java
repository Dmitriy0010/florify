package ru.florify.employee.domain.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Getter
@Setter
@Builder(toBuilder = true)
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class TimesheetEntry {
    @EqualsAndHashCode.Include
    private UUID id;
    private UUID employeeId;
    private LocalDate date;
    private Instant checkinAt;
    private Instant checkoutAt;
    private BigDecimal hoursWorked;

    public TimesheetEntry checkout(Instant checkoutInstant) {
        BigDecimal hours = BigDecimal.valueOf(Duration.between(checkinAt, checkoutInstant).toMinutes())
                .divide(BigDecimal.valueOf(60), 2, RoundingMode.HALF_UP);
        return this.toBuilder()
                .checkoutAt(checkoutInstant)
                .hoursWorked(hours.max(BigDecimal.ZERO))
                .build();
    }
}
