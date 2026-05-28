package ru.florify.employee.application.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.florify.common.exception.ConflictException;
import ru.florify.common.exception.NotFoundException;
import ru.florify.employee.application.command.CheckinCommand;
import ru.florify.employee.application.command.CheckoutCommand;
import ru.florify.employee.application.command.ScheduleCommand;
import ru.florify.employee.application.port.in.TimesheetUseCase;
import ru.florify.employee.application.port.out.EmployeeRepository;
import ru.florify.employee.application.port.out.TimesheetRepository;
import ru.florify.employee.domain.exception.EmployeeNotFoundException;
import ru.florify.employee.domain.model.TimesheetEntry;

import java.math.BigDecimal;
import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TimesheetInteractor implements TimesheetUseCase {

    private final TimesheetRepository timesheetRepository;
    private final EmployeeRepository employeeRepository;
    private final Clock clock;

    @Override
    @Transactional
    public TimesheetEntry checkin(CheckinCommand command) {
        assertEmployee(command.employeeId());
        LocalDate today = LocalDate.now(clock);
        if (timesheetRepository.findByEmployeeAndDate(command.employeeId(), today).isPresent()) {
            throw new ConflictException("Check-in already exists for date: " + today);
        }
        TimesheetEntry entry = TimesheetEntry.builder()
                .id(UUID.randomUUID())
                .employeeId(command.employeeId())
                .date(today)
                .checkinAt(clock.instant())
                .hoursWorked(BigDecimal.ZERO)
                .build();
        return timesheetRepository.save(entry);
    }

    @Override
    @Transactional
    public TimesheetEntry checkout(CheckoutCommand command) {
        assertEmployee(command.employeeId());
        LocalDate today = LocalDate.now(clock);
        TimesheetEntry current = timesheetRepository.findByEmployeeAndDate(command.employeeId(), today)
                .orElseThrow(() -> new NotFoundException("TimesheetEntry", command.employeeId() + ":" + today));
        if (current.getCheckoutAt() != null) {
            throw new ConflictException("Checkout already completed for date: " + today);
        }
        Instant now = clock.instant();
        return timesheetRepository.save(current.checkout(now));
    }

    @Override
    @Transactional
    public TimesheetEntry schedule(ScheduleCommand command) {
        assertEmployee(command.employeeId());
        TimesheetEntry entry = timesheetRepository.findByEmployeeAndDate(command.employeeId(), command.date())
                .orElseGet(() -> TimesheetEntry.builder()
                        .id(UUID.randomUUID())
                        .employeeId(command.employeeId())
                        .date(command.date())
                        .build());
        
        entry.setScheduledStartAt(command.scheduledStartAt());
        entry.setScheduledEndAt(command.scheduledEndAt());
        
        return timesheetRepository.save(entry);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TimesheetEntry> list(UUID employeeId, YearMonth month) {
        assertEmployee(employeeId);
        return timesheetRepository.findByEmployeeAndMonth(employeeId, month);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TimesheetEntry> listAll(YearMonth month) {
        return timesheetRepository.findAllByMonth(month);
    }

    private void assertEmployee(UUID employeeId) {
        if (employeeRepository.findById(employeeId).isEmpty()) {
            throw new EmployeeNotFoundException(employeeId);
        }
    }
}
