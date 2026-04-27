package ru.florify.supplier.adapter.out.persistence.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import ru.florify.supplier.adapter.out.persistence.entity.SupplierJpaEntity;

import java.util.UUID;

public interface SupplierJpaRepository extends JpaRepository<SupplierJpaEntity, UUID> {

    boolean existsByTaxId(String taxId);

    @Query("""
           SELECT s FROM SupplierEntity s
           WHERE (:search IS NULL OR LOWER(s.name) LIKE :search OR LOWER(s.contactPerson) LIKE :search)
           AND (:active IS NULL OR s.active = :active)
           ORDER BY s.name ASC
           """)
    Page<SupplierJpaEntity> findAllWithFilters(
            @Param("search") String search,
            @Param("active") Boolean active,
            Pageable pageable);
}
