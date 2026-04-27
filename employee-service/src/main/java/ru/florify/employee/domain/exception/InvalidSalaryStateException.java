package ru.florify.employee.domain.exception;

import ru.florify.common.exception.ConflictException;

public class InvalidSalaryStateException extends ConflictException {
    public InvalidSalaryStateException(String message) {
        super(message);
    }
}
