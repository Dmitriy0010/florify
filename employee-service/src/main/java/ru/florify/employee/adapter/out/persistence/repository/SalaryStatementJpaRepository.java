package ru.florify.employee.adapter.out.persistence.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import ru.florify.employee.adapter.out.persistence.entity.SalaryStatementJpaEntity;

import java.util.Optional;
import java.util.UUID;

public interface SalaryStatementJpaRepository extends JpaRepository<SalaryStatementJpaEntity, UUID> {
    Optional<SalaryStatementJpaEntity> findByEmployeeIdAndPeriod(UUID employeeId, String period);

    @Query("""
            SELECT s FROM SalaryStatementEntity s
            WHERE (:employeeId IS NULL OR s.employeeId = :employeeId)
              AND (:period IS NULL OR s.period = :period)
            """)
    Page<SalaryStatementJpaEntity> findAllWithFilters(@Param("employeeId") UUID employeeId,
                                                      @Param("period") String period,
                                                      Pageable pageable);
}
