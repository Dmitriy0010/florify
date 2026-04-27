package ru.florify.employee.application.command;

import java.util.UUID;

public record ApproveSalaryCommand(
        UUID statementId,
        UUID performerId
) {
}
