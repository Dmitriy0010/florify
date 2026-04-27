package ru.florify.employee.adapter.out.persistence.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import ru.florify.employee.adapter.out.persistence.entity.EmployeeJpaEntity;

import java.util.UUID;

public interface EmployeeJpaRepository extends JpaRepository<EmployeeJpaEntity, UUID> {
    boolean existsByUserId(UUID userId);

    @Query("""
            SELECT e FROM EmployeeEntity e
            WHERE (:active IS NULL OR e.active = :active)
              AND (:search IS NULL OR :search = ''
                                   OR LOWER(e.firstName) LIKE LOWER(CONCAT('%', :search, '%'))
                                  OR LOWER(e.lastName) LIKE LOWER(CONCAT('%', :search, '%')))
            """)
    Page<EmployeeJpaEntity> findAllWithFilters(@Param("search") String search, @Param("active") Boolean active, Pageable pageable);
}
