package ru.florify.employee.application.port.out;

import ru.florify.employee.domain.model.SalaryConfig;

import java.util.Optional;
import java.util.UUID;

public interface SalaryConfigRepository {
    SalaryConfig save(SalaryConfig config);
    Optional<SalaryConfig> findCurrentByEmployeeId(UUID employeeId);
}
