package ru.florify.employee.application.command;

import java.util.UUID;

public record CheckinCommand(
        UUID employeeId
) {
}
