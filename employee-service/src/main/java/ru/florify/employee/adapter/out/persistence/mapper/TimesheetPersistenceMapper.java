package ru.florify.employee.adapter.out.persistence.mapper;

import org.mapstruct.Mapper;
import ru.florify.employee.adapter.out.persistence.entity.TimesheetEntryJpaEntity;
import ru.florify.employee.domain.model.TimesheetEntry;

@Mapper(componentModel = "spring")
public interface TimesheetPersistenceMapper {
    TimesheetEntryJpaEntity toEntity(TimesheetEntry entry);
    TimesheetEntry toDomain(TimesheetEntryJpaEntity entity);
}
