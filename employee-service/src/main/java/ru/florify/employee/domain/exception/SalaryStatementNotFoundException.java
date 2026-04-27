package ru.florify.employee.domain.exception;

import ru.florify.common.exception.NotFoundException;

import java.util.UUID;

public class SalaryStatementNotFoundException extends NotFoundException {
    public SalaryStatementNotFoundException(UUID id) {
        super("SalaryStatement", id);
    }
}
