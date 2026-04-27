package ru.florify.employee.adapter.in.web.mapper;

import org.mapstruct.Mapper;
import ru.florify.employee.adapter.in.web.dto.CreateEmployeeRequest;
import ru.florify.employee.adapter.in.web.dto.EmployeeResponse;
import ru.florify.employee.adapter.in.web.dto.UpdateEmployeeRequest;
import ru.florify.employee.application.command.CreateEmployeeCommand;
import ru.florify.employee.application.command.UpdateEmployeeCommand;
import ru.florify.employee.domain.model.Employee;

import java.util.UUID;

@Mapper(componentModel = "spring")
public interface EmployeeWebMapper {
    CreateEmployeeCommand toCommand(CreateEmployeeRequest request);
    UpdateEmployeeCommand toCommand(UUID employeeId, UpdateEmployeeRequest request);
    EmployeeResponse toResponse(Employee employee);
}
