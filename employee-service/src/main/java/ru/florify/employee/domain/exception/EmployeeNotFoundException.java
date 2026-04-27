package ru.florify.employee.domain.exception;

import ru.florify.common.exception.NotFoundException;

import java.util.UUID;

public class EmployeeNotFoundException extends NotFoundException {
    public EmployeeNotFoundException(UUID id) {
        super("Employee", id);
    }
}
