package ru.florify.employee.adapter.out.persistence;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import ru.florify.employee.adapter.out.persistence.mapper.TimesheetPersistenceMapper;
import ru.florify.employee.adapter.out.persistence.repository.TimesheetEntryJpaRepository;
import ru.florify.employee.application.port.out.TimesheetRepository;
import ru.florify.employee.domain.model.TimesheetEntry;

import java.time.YearMonth;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class TimesheetPersistenceAdapter implements TimesheetRepository {

    private final TimesheetEntryJpaRepository jpaRepository;
    private final TimesheetPersistenceMapper mapper;

    @Override
    public TimesheetEntry save(TimesheetEntry entry) {
        return mapper.toDomain(jpaRepository.save(mapper.toEntity(entry)));
    }

    @Override
    public Optional<TimesheetEntry> findByEmployeeAndDate(UUID employeeId, java.time.LocalDate date) {
        return jpaRepository.findByEmployeeIdAndDate(employeeId, date).map(mapper::toDomain);
    }

    @Override
    public List<TimesheetEntry> findByEmployeeAndMonth(UUID employeeId, YearMonth month) {
        return jpaRepository.findByEmployeeIdAndDateBetween(employeeId, month.atDay(1), month.atEndOfMonth())
                .stream()
                .map(mapper::toDomain)
                .toList();
    }

    @Override
    public List<TimesheetEntry> findAllByMonth(YearMonth month) {
        return jpaRepository.findByDateBetween(month.atDay(1), month.atEndOfMonth())
                .stream()
                .map(mapper::toDomain)
                .toList();
    }
}
