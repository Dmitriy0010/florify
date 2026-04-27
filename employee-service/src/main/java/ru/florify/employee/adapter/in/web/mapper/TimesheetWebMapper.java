package ru.florify.employee.adapter.in.web.mapper;

import org.mapstruct.Mapper;
import ru.florify.employee.adapter.in.web.dto.TimesheetEntryResponse;
import ru.florify.employee.domain.model.TimesheetEntry;

@Mapper(componentModel = "spring")
public interface TimesheetWebMapper {
    TimesheetEntryResponse toResponse(TimesheetEntry entry);
}
