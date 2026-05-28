package ru.florify.employee.application.command;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record ScheduleCommand(
        UUID employeeId,
        LocalDate date,
        Instant scheduledStartAt,
        Instant scheduledEndAt
) {
}
