package ru.florify.employee.application.port.out;

import ru.florify.common.application.query.PagedResult;
import ru.florify.employee.domain.model.Employee;

import java.util.Optional;
import java.util.UUID;

public interface EmployeeRepository {
    Employee save(Employee employee);
    Optional<Employee> findById(UUID id);
    boolean existsByUserId(UUID userId);
    PagedResult<Employee> findAll(String search, Boolean active, int page, int size);
}
