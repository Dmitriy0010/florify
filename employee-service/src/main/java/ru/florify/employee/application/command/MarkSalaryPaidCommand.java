package ru.florify.employee.application.command;

import java.util.UUID;

public record MarkSalaryPaidCommand(
        UUID statementId
) {
}
