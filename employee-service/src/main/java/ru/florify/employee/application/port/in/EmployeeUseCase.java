package ru.florify.employee.application.port.in;

import ru.florify.common.application.query.PagedResult;
import ru.florify.employee.application.command.CreateEmployeeCommand;
import ru.florify.employee.application.command.UpdateEmployeeCommand;
import ru.florify.employee.domain.model.Employee;

import java.util.UUID;

public interface EmployeeUseCase {
    Employee create(CreateEmployeeCommand command);
    Employee update(UpdateEmployeeCommand command);
    Employee getById(UUID employeeId);
    PagedResult<Employee> list(String search, Boolean active, int page, int size);
}
