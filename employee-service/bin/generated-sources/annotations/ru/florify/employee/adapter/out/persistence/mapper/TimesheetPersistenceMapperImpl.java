package ru.florify.employee.adapter.out.persistence.mapper;

import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;
import ru.florify.employee.adapter.out.persistence.entity.TimesheetEntryJpaEntity;
import ru.florify.employee.domain.model.TimesheetEntry;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-05-05T13:18:39+0300",
    comments = "version: 1.6.3, compiler: Eclipse JDT (IDE) 3.45.0.v20260224-0835, environment: Java 21.0.10 (Eclipse Adoptium)"
)
@Component
public class TimesheetPersistenceMapperImpl implements TimesheetPersistenceMapper {

    @Override
    public TimesheetEntryJpaEntity toEntity(TimesheetEntry entry) {
        if ( entry == null ) {
            return null;
        }

        TimesheetEntryJpaEntity.TimesheetEntryJpaEntityBuilder timesheetEntryJpaEntity = TimesheetEntryJpaEntity.builder();

        timesheetEntryJpaEntity.checkinAt( entry.getCheckinAt() );
        timesheetEntryJpaEntity.checkoutAt( entry.getCheckoutAt() );
        timesheetEntryJpaEntity.date( entry.getDate() );
        timesheetEntryJpaEntity.employeeId( entry.getEmployeeId() );
        timesheetEntryJpaEntity.hoursWorked( entry.getHoursWorked() );
        timesheetEntryJpaEntity.id( entry.getId() );

        return timesheetEntryJpaEntity.build();
    }

    @Override
    public TimesheetEntry toDomain(TimesheetEntryJpaEntity entity) {
        if ( entity == null ) {
            return null;
        }

        TimesheetEntry.TimesheetEntryBuilder timesheetEntry = TimesheetEntry.builder();

        timesheetEntry.checkinAt( entity.getCheckinAt() );
        timesheetEntry.checkoutAt( entity.getCheckoutAt() );
        timesheetEntry.date( entity.getDate() );
        timesheetEntry.employeeId( entity.getEmployeeId() );
        timesheetEntry.hoursWorked( entity.getHoursWorked() );
        timesheetEntry.id( entity.getId() );

        return timesheetEntry.build();
    }
}
