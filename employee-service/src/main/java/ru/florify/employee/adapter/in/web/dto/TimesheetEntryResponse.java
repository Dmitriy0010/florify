package ru.florify.employee.adapter.in.web.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record TimesheetEntryResponse(
        UUID id,
        UUID employeeId,
        LocalDate date,
        Instant checkinAt,
        Instant checkoutAt,
        BigDecimal hoursWorked
) {
}
