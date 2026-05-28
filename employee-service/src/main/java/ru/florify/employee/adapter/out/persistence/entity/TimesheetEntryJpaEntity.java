package ru.florify.employee.adapter.out.persistence.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Entity(name = "TimesheetEntryEntity")
@Table(name = "employee_timesheet")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class TimesheetEntryJpaEntity {
    @Id
    @EqualsAndHashCode.Include
    private UUID id;
    private UUID employeeId;
    private LocalDate date;
    @Column(nullable = true)
    private Instant checkinAt;
    @Column(nullable = true)
    private Instant checkoutAt;
    private Instant scheduledStartAt;
    private Instant scheduledEndAt;
    private BigDecimal hoursWorked;
}
