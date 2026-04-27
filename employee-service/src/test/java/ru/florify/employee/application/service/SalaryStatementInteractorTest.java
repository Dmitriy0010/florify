package ru.florify.employee.application.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import ru.florify.employee.application.command.CalculateSalaryCommand;
import ru.florify.employee.application.port.out.EmployeeOrderSalesQuery;
import ru.florify.employee.application.port.out.EmployeeRepository;
import ru.florify.employee.application.port.out.SalaryConfigRepository;
import ru.florify.employee.application.port.out.SalaryPaidEventPublisher;
import ru.florify.employee.application.port.out.SalaryStatementRepository;
import ru.florify.employee.domain.model.Employee;
import ru.florify.employee.domain.model.SalaryConfig;
import ru.florify.employee.domain.model.SalaryStatement;
import ru.florify.employee.domain.model.SalaryType;

import java.math.BigDecimal;
import java.time.Clock;
import java.time.Instant;
import java.time.YearMonth;
import java.time.ZoneOffset;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SalaryStatementInteractorTest {

    @Mock private EmployeeRepository employeeRepository;
    @Mock private SalaryConfigRepository salaryConfigRepository;
    @Mock private SalaryStatementRepository salaryStatementRepository;
    @Mock private EmployeeOrderSalesQuery employeeOrderSalesQuery;
    @Mock private SalaryPaidEventPublisher salaryPaidEventPublisher;

    @InjectMocks
    private SalaryStatementInteractor interactor;

    @Test
    void calculateBuildsStatementByConfigAndSalesAggregate() {
        UUID employeeId = UUID.randomUUID();
        YearMonth period = YearMonth.of(2026, 4);

        interactor = new SalaryStatementInteractor(
                employeeRepository,
                salaryConfigRepository,
                salaryStatementRepository,
                employeeOrderSalesQuery,
                salaryPaidEventPublisher,
                Clock.fixed(Instant.parse("2026-04-01T00:00:00Z"), ZoneOffset.UTC)
        );

        when(employeeRepository.findById(employeeId)).thenReturn(Optional.of(Employee.builder().id(employeeId).build()));
        when(salaryConfigRepository.findCurrentByEmployeeId(employeeId)).thenReturn(Optional.of(
                SalaryConfig.builder()
                        .id(UUID.randomUUID())
                        .employeeId(employeeId)
                        .type(SalaryType.FIXED_PLUS_PERCENT)
                        .baseAmount(BigDecimal.valueOf(1000))
                        .salesPercent(BigDecimal.TEN)
                        .bonusPerOrder(BigDecimal.valueOf(50))
                        .build()
        ));
        when(employeeOrderSalesQuery.salesForEmployeeInPeriod(employeeId, period))
                .thenReturn(new EmployeeOrderSalesQuery.SalesTotals(BigDecimal.valueOf(5000), 2));
        when(salaryStatementRepository.findByEmployeeAndPeriod(employeeId, period)).thenReturn(Optional.empty());
        when(salaryStatementRepository.save(any(SalaryStatement.class))).thenAnswer(invocation -> invocation.getArgument(0));

        SalaryStatement result = interactor.calculate(new CalculateSalaryCommand(employeeId, period));

        assertEquals(BigDecimal.valueOf(1000), result.getBaseSalary());
        assertEquals(BigDecimal.valueOf(500), result.getSalesBonus());
        assertEquals(BigDecimal.valueOf(100), result.getOrderBonus());
        assertEquals(BigDecimal.valueOf(1600), result.getTotalPayout());
    }
}
