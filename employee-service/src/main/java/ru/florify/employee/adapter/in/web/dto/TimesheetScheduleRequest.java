package ru.florify.employee.adapter.in.web.dto;

import jakarta.validation.constraints.NotNull;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record TimesheetScheduleRequest(
        @NotNull UUID employeeId,
        @NotNull LocalDate date,
        @NotNull Instant scheduledStartAt,
        @NotNull Instant scheduledEndAt
) {
}
