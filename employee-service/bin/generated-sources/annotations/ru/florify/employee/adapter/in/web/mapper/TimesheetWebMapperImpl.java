package ru.florify.employee.adapter.in.web.mapper;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;
import ru.florify.employee.adapter.in.web.dto.TimesheetEntryResponse;
import ru.florify.employee.domain.model.TimesheetEntry;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-05-05T13:18:39+0300",
    comments = "version: 1.6.3, compiler: Eclipse JDT (IDE) 3.45.0.v20260224-0835, environment: Java 21.0.10 (Eclipse Adoptium)"
)
@Component
public class TimesheetWebMapperImpl implements TimesheetWebMapper {

    @Override
    public TimesheetEntryResponse toResponse(TimesheetEntry entry) {
        if ( entry == null ) {
            return null;
        }

        UUID id = null;
        UUID employeeId = null;
        LocalDate date = null;
        Instant checkinAt = null;
        Instant checkoutAt = null;
        BigDecimal hoursWorked = null;

        id = entry.getId();
        employeeId = entry.getEmployeeId();
        date = entry.getDate();
        checkinAt = entry.getCheckinAt();
        checkoutAt = entry.getCheckoutAt();
        hoursWorked = entry.getHoursWorked();

        TimesheetEntryResponse timesheetEntryResponse = new TimesheetEntryResponse( id, employeeId, date, checkinAt, checkoutAt, hoursWorked );

        return timesheetEntryResponse;
    }
}
