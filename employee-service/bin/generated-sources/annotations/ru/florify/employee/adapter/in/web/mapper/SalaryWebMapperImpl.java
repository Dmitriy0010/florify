package ru.florify.employee.adapter.in.web.mapper;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.UUID;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;
import ru.florify.employee.adapter.in.web.dto.SalaryConfigResponse;
import ru.florify.employee.adapter.in.web.dto.SalaryStatementResponse;
import ru.florify.employee.adapter.in.web.dto.UpsertSalaryConfigRequest;
import ru.florify.employee.application.command.UpsertSalaryConfigCommand;
import ru.florify.employee.domain.model.PaymentStatus;
import ru.florify.employee.domain.model.SalaryConfig;
import ru.florify.employee.domain.model.SalaryStatement;
import ru.florify.employee.domain.model.SalaryType;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-05-05T13:18:39+0300",
    comments = "version: 1.6.3, compiler: Eclipse JDT (IDE) 3.45.0.v20260224-0835, environment: Java 21.0.10 (Eclipse Adoptium)"
)
@Component
public class SalaryWebMapperImpl implements SalaryWebMapper {

    @Override
    public UpsertSalaryConfigCommand toCommand(UUID employeeId, UpsertSalaryConfigRequest request) {
        if ( employeeId == null && request == null ) {
            return null;
        }

        SalaryType type = null;
        BigDecimal baseAmount = null;
        BigDecimal salesPercent = null;
        BigDecimal bonusPerOrder = null;
        LocalDate validFrom = null;
        if ( request != null ) {
            type = request.type();
            baseAmount = request.baseAmount();
            salesPercent = request.salesPercent();
            bonusPerOrder = request.bonusPerOrder();
            validFrom = request.validFrom();
        }
        UUID employeeId1 = null;
        employeeId1 = employeeId;

        UpsertSalaryConfigCommand upsertSalaryConfigCommand = new UpsertSalaryConfigCommand( employeeId1, type, baseAmount, salesPercent, bonusPerOrder, validFrom );

        return upsertSalaryConfigCommand;
    }

    @Override
    public SalaryConfigResponse toResponse(SalaryConfig salaryConfig) {
        if ( salaryConfig == null ) {
            return null;
        }

        UUID id = null;
        UUID employeeId = null;
        SalaryType type = null;
        BigDecimal baseAmount = null;
        BigDecimal salesPercent = null;
        BigDecimal bonusPerOrder = null;
        LocalDate validFrom = null;

        id = salaryConfig.getId();
        employeeId = salaryConfig.getEmployeeId();
        type = salaryConfig.getType();
        baseAmount = salaryConfig.getBaseAmount();
        salesPercent = salaryConfig.getSalesPercent();
        bonusPerOrder = salaryConfig.getBonusPerOrder();
        validFrom = salaryConfig.getValidFrom();

        SalaryConfigResponse salaryConfigResponse = new SalaryConfigResponse( id, employeeId, type, baseAmount, salesPercent, bonusPerOrder, validFrom );

        return salaryConfigResponse;
    }

    @Override
    public SalaryStatementResponse toResponse(SalaryStatement statement) {
        if ( statement == null ) {
            return null;
        }

        UUID id = null;
        UUID employeeId = null;
        YearMonth period = null;
        BigDecimal baseSalary = null;
        BigDecimal salesBonus = null;
        BigDecimal orderBonus = null;
        BigDecimal manualBonus = null;
        BigDecimal deductions = null;
        BigDecimal totalPayout = null;
        PaymentStatus status = null;
        UUID approvedBy = null;
        Instant paidAt = null;

        id = statement.getId();
        employeeId = statement.getEmployeeId();
        period = statement.getPeriod();
        baseSalary = statement.getBaseSalary();
        salesBonus = statement.getSalesBonus();
        orderBonus = statement.getOrderBonus();
        manualBonus = statement.getManualBonus();
        deductions = statement.getDeductions();
        totalPayout = statement.getTotalPayout();
        status = statement.getStatus();
        approvedBy = statement.getApprovedBy();
        paidAt = statement.getPaidAt();

        SalaryStatementResponse salaryStatementResponse = new SalaryStatementResponse( id, employeeId, period, baseSalary, salesBonus, orderBonus, manualBonus, deductions, totalPayout, status, approvedBy, paidAt );

        return salaryStatementResponse;
    }
}
