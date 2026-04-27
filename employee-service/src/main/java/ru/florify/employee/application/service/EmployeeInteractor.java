package ru.florify.employee.application.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.florify.common.application.query.PagedResult;
import ru.florify.common.exception.ConflictException;
import ru.florify.employee.application.command.CreateEmployeeCommand;
import ru.florify.employee.application.command.UpdateEmployeeCommand;
import ru.florify.employee.application.port.in.EmployeeUseCase;
import ru.florify.employee.application.port.out.EmployeeRepository;
import ru.florify.employee.domain.exception.EmployeeNotFoundException;
import ru.florify.employee.domain.model.Employee;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class EmployeeInteractor implements EmployeeUseCase {

    private final EmployeeRepository employeeRepository;

    @Override
    @Transactional
    public Employee create(CreateEmployeeCommand command) {
        if (employeeRepository.existsByUserId(command.userId())) {
            throw new ConflictException("Employee for user already exists: " + command.userId());
        }
        Employee employee = Employee.builder()
                .id(UUID.randomUUID())
                .userId(command.userId())
                .storeId(command.storeId())
                .firstName(command.firstName())
                .lastName(command.lastName())
                .phone(command.phone())
                .role(command.role())
                .hireDate(command.hireDate())
                .active(true)
                .avatarUrl(command.avatarUrl())
                .build();
        return employeeRepository.save(employee);
    }

    @Override
    @Transactional
    public Employee update(UpdateEmployeeCommand command) {
        Employee existing = getById(command.employeeId());
        Employee updated = existing.toBuilder()
                .storeId(command.storeId())
                .firstName(command.firstName())
                .lastName(command.lastName())
                .phone(command.phone())
                .role(command.role())
                .dismissDate(command.dismissDate())
                .active(command.active())
                .avatarUrl(command.avatarUrl())
                .build();
        return employeeRepository.save(updated);
    }

    @Override
    @Transactional(readOnly = true)
    public Employee getById(UUID employeeId) {
        return employeeRepository.findById(employeeId).orElseThrow(() -> new EmployeeNotFoundException(employeeId));
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResult<Employee> list(String search, Boolean active, int page, int size) {
        return employeeRepository.findAll(search, active, page, size);
    }
}
