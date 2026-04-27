package ru.florify.employee.application.port.in;

import ru.florify.common.application.query.PagedResult;
import ru.florify.employee.application.command.ApproveSalaryCommand;
import ru.florify.employee.application.command.CalculateSalaryCommand;
import ru.florify.employee.application.command.MarkSalaryPaidCommand;
import ru.florify.employee.domain.model.SalaryStatement;

import java.time.YearMonth;
import java.util.UUID;

public interface SalaryStatementUseCase {
    SalaryStatement calculate(CalculateSalaryCommand command);
    SalaryStatement approve(ApproveSalaryCommand command);
    SalaryStatement markPaid(MarkSalaryPaidCommand command);
    SalaryStatement adjust(ru.florify.employee.application.command.AdjustSalaryCommand command);
    PagedResult<SalaryStatement> list(UUID employeeId, YearMonth period, int page, int size);
}
