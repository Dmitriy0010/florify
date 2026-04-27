package ru.florify.employee.adapter.out.persistence.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import ru.florify.employee.adapter.out.persistence.entity.TimesheetEntryJpaEntity;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface TimesheetEntryJpaRepository extends JpaRepository<TimesheetEntryJpaEntity, UUID> {
    Optional<TimesheetEntryJpaEntity> findByEmployeeIdAndDate(UUID employeeId, LocalDate date);
    List<TimesheetEntryJpaEntity> findByEmployeeIdAndDateBetween(UUID employeeId, LocalDate start, LocalDate end);
    List<TimesheetEntryJpaEntity> findByDateBetween(LocalDate start, LocalDate end);
}
