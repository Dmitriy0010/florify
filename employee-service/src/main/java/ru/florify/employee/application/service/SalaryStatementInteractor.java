package ru.florify.employee.application.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.florify.common.application.query.PagedResult;
import ru.florify.employee.application.command.ApproveSalaryCommand;
import ru.florify.employee.application.command.CalculateSalaryCommand;
import ru.florify.employee.application.command.MarkSalaryPaidCommand;
import ru.florify.employee.application.port.in.SalaryStatementUseCase;
import ru.florify.employee.application.port.out.EmployeeOrderSalesQuery;
import ru.florify.employee.application.port.out.EmployeeRepository;
import ru.florify.employee.application.port.out.SalaryConfigRepository;
import ru.florify.employee.application.port.out.SalaryPaidEventPublisher;
import ru.florify.employee.application.port.out.SalaryStatementRepository;
import ru.florify.employee.domain.exception.EmployeeNotFoundException;
import ru.florify.employee.domain.exception.SalaryStatementNotFoundException;
import ru.florify.employee.domain.model.PaymentStatus;
import ru.florify.employee.domain.model.SalaryConfig;
import ru.florify.employee.domain.model.SalaryStatement;
import ru.florify.employee.domain.model.SalaryType;

import java.math.BigDecimal;
import java.time.Clock;
import java.time.Instant;
import java.time.YearMonth;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SalaryStatementInteractor implements SalaryStatementUseCase {

    private final EmployeeRepository employeeRepository;
    private final SalaryConfigRepository salaryConfigRepository;
    private final SalaryStatementRepository salaryStatementRepository;
    private final EmployeeOrderSalesQuery employeeOrderSalesQuery;
    private final SalaryPaidEventPublisher salaryPaidEventPublisher;
    private final Clock clock;

    @Override
    @Transactional
    public SalaryStatement calculate(CalculateSalaryCommand command) {
        var employee = employeeRepository.findById(command.employeeId())
                .orElseThrow(() -> new EmployeeNotFoundException(command.employeeId()));
        
        SalaryConfig config = salaryConfigRepository.findCurrentByEmployeeId(command.employeeId())
                .orElseThrow(() -> new EmployeeNotFoundException(command.employeeId()));
        EmployeeOrderSalesQuery.SalesTotals sales = employeeOrderSalesQuery.salesForEmployeeInPeriod(
                command.employeeId(), command.period());
        BigDecimal base = config.getType() == SalaryType.PERCENT_ONLY ? BigDecimal.ZERO : nz(config.getBaseAmount());
        BigDecimal salesBonus = nz(sales.totalSalesAmount()).multiply(nz(config.getSalesPercent()))
                .divide(BigDecimal.valueOf(100));
        BigDecimal orderBonus = nz(config.getBonusPerOrder()).multiply(BigDecimal.valueOf(sales.ordersCount()));
        BigDecimal total = base.add(salesBonus).add(orderBonus);

        SalaryStatement existing = salaryStatementRepository.findByEmployeeAndPeriod(command.employeeId(), command.period()).orElse(null);
        SalaryStatement statement = SalaryStatement.builder()
                .id(existing != null ? existing.getId() : UUID.randomUUID())
                .employeeId(command.employeeId())
                .storeId(employee.getStoreId()) // Capture storeId from employee
                .period(command.period())
                .baseSalary(base)
                .salesBonus(salesBonus)
                .orderBonus(orderBonus)
                .manualBonus(existing != null ? existing.getManualBonus() : BigDecimal.ZERO)
                .deductions(existing != null ? existing.getDeductions() : BigDecimal.ZERO)
                .totalPayout(total)
                .status(PaymentStatus.DRAFT)
                .approvedBy(null)
                .paidAt(null)
                .build();
        return salaryStatementRepository.save(statement);
    }

    @Override
    @Transactional
    public SalaryStatement approve(ApproveSalaryCommand command) {
        SalaryStatement statement = salaryStatementRepository.findById(command.statementId())
                .orElseThrow(() -> new SalaryStatementNotFoundException(command.statementId()));
        SalaryStatement approved = salaryStatementRepository.save(statement.approve(command.performerId()));
        return recalculateTotal(approved);
    }

    @Override
    @Transactional
    public SalaryStatement markPaid(MarkSalaryPaidCommand command) {
        SalaryStatement statement = salaryStatementRepository.findById(command.statementId())
                .orElseThrow(() -> new SalaryStatementNotFoundException(command.statementId()));
        SalaryStatement paid = salaryStatementRepository.save(statement.markPaid(clock.instant()));
        salaryPaidEventPublisher.publish(paid);
        return paid;
    }

    @Override
    @Transactional
    public SalaryStatement adjust(ru.florify.employee.application.command.AdjustSalaryCommand command) {
        SalaryStatement statement = salaryStatementRepository.findById(command.statementId())
                .orElseThrow(() -> new SalaryStatementNotFoundException(command.statementId()));
        SalaryStatement adjusted = statement.toBuilder()
                .manualBonus(command.manualBonus())
                .deductions(command.deductions())
                .build();
        return recalculateTotal(adjusted);
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResult<SalaryStatement> list(UUID employeeId, YearMonth period, int page, int size) {
        return salaryStatementRepository.findAll(employeeId, period, page, size);
    }

    private SalaryStatement recalculateTotal(SalaryStatement statement) {
        BigDecimal total = nz(statement.getBaseSalary())
                .add(nz(statement.getSalesBonus()))
                .add(nz(statement.getOrderBonus()))
                .add(nz(statement.getManualBonus()))
                .subtract(nz(statement.getDeductions()));
        return salaryStatementRepository.save(statement.toBuilder().totalPayout(total).build());
    }

    private BigDecimal nz(BigDecimal value) {
        return value == null ? BigDecimal.ZERO : value;
    }
}
