package ru.florify.employee.application.port.in;

import ru.florify.employee.application.command.CheckinCommand;
import ru.florify.employee.application.command.CheckoutCommand;
import ru.florify.employee.domain.model.TimesheetEntry;

import java.time.YearMonth;
import java.util.List;
import java.util.UUID;

public interface TimesheetUseCase {
    TimesheetEntry checkin(CheckinCommand command);
    TimesheetEntry checkout(CheckoutCommand command);
    List<TimesheetEntry> list(UUID employeeId, YearMonth month);
    List<TimesheetEntry> listAll(YearMonth month);
}
