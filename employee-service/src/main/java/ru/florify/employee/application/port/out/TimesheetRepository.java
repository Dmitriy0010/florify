package ru.florify.employee.application.port.out;

import ru.florify.employee.domain.model.TimesheetEntry;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface TimesheetRepository {
    TimesheetEntry save(TimesheetEntry entry);

    Optional<TimesheetEntry> findByEmployeeAndDate(UUID employeeId, LocalDate date);

    List<TimesheetEntry> findByEmployeeAndMonth(UUID employeeId, YearMonth month);

    List<TimesheetEntry> findAllByMonth(YearMonth month);
}
