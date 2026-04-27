package ru.florify.employee.adapter.out.persistence.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import ru.florify.employee.adapter.out.persistence.entity.SalaryConfigJpaEntity;

import java.util.Optional;
import java.util.UUID;

public interface SalaryConfigJpaRepository extends JpaRepository<SalaryConfigJpaEntity, UUID> {
    Optional<SalaryConfigJpaEntity> findTopByEmployeeIdOrderByValidFromDesc(UUID employeeId);
}
