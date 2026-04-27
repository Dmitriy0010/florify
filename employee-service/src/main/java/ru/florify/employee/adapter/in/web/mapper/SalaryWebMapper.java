package ru.florify.employee.adapter.in.web.mapper;

import org.mapstruct.Mapper;
import ru.florify.employee.adapter.in.web.dto.SalaryConfigResponse;
import ru.florify.employee.adapter.in.web.dto.SalaryStatementResponse;
import ru.florify.employee.adapter.in.web.dto.UpsertSalaryConfigRequest;
import ru.florify.employee.application.command.UpsertSalaryConfigCommand;
import ru.florify.employee.domain.model.SalaryConfig;
import ru.florify.employee.domain.model.SalaryStatement;

import java.util.UUID;

@Mapper(componentModel = "spring")
public interface SalaryWebMapper {
    UpsertSalaryConfigCommand toCommand(UUID employeeId, UpsertSalaryConfigRequest request);
    SalaryConfigResponse toResponse(SalaryConfig salaryConfig);
    SalaryStatementResponse toResponse(SalaryStatement statement);
}
