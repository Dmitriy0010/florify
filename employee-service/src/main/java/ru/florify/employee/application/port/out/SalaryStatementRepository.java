package ru.florify.employee.application.port.out;

import ru.florify.common.application.query.PagedResult;
import ru.florify.employee.domain.model.SalaryStatement;

import java.time.YearMonth;
import java.util.Optional;
import java.util.UUID;

public interface SalaryStatementRepository {
    SalaryStatement save(SalaryStatement statement);
    Optional<SalaryStatement> findById(UUID id);
    Optional<SalaryStatement> findByEmployeeAndPeriod(UUID employeeId, YearMonth period);
    PagedResult<SalaryStatement> findAll(UUID employeeId, YearMonth period, int page, int size);
}
