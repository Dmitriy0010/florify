package ru.florify.employee.application.port.in;

import ru.florify.employee.application.command.UpsertSalaryConfigCommand;
import ru.florify.employee.domain.model.SalaryConfig;

import java.util.UUID;

public interface SalaryConfigUseCase {
    SalaryConfig getByEmployeeId(UUID employeeId);
    SalaryConfig upsert(UpsertSalaryConfigCommand command);
}
