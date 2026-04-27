package ru.florify.employee.application.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.florify.common.exception.NotFoundException;
import ru.florify.employee.application.command.UpsertSalaryConfigCommand;
import ru.florify.employee.application.port.in.SalaryConfigUseCase;
import ru.florify.employee.application.port.out.EmployeeRepository;
import ru.florify.employee.application.port.out.SalaryConfigRepository;
import ru.florify.employee.domain.exception.EmployeeNotFoundException;
import ru.florify.employee.domain.model.SalaryConfig;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SalaryConfigInteractor implements SalaryConfigUseCase {

    private final SalaryConfigRepository salaryConfigRepository;
    private final EmployeeRepository employeeRepository;

    @Override
    @Transactional(readOnly = true)
    public SalaryConfig getByEmployeeId(UUID employeeId) {
        if (employeeRepository.findById(employeeId).isEmpty()) {
            throw new EmployeeNotFoundException(employeeId);
        }
        return salaryConfigRepository.findCurrentByEmployeeId(employeeId)
                .orElseThrow(() -> new NotFoundException("SalaryConfig", employeeId));
    }

    @Override
    @Transactional
    public SalaryConfig upsert(UpsertSalaryConfigCommand command) {
        if (employeeRepository.findById(command.employeeId()).isEmpty()) {
            throw new EmployeeNotFoundException(command.employeeId());
        }
        SalaryConfig existing = salaryConfigRepository.findCurrentByEmployeeId(command.employeeId()).orElse(null);
        SalaryConfig config = SalaryConfig.builder()
                .id(existing != null ? existing.getId() : UUID.randomUUID())
                .employeeId(command.employeeId())
                .type(command.type())
                .baseAmount(command.baseAmount())
                .salesPercent(command.salesPercent())
                .bonusPerOrder(command.bonusPerOrder())
                .validFrom(command.validFrom())
                .build();
        return salaryConfigRepository.save(config);
    }
}
