package ru.florify.employee.application.port.out;

import ru.florify.employee.domain.model.SalaryStatement;

public interface SalaryPaidEventPublisher {
    void publish(SalaryStatement statement);
}
