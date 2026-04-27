package ru.florify.supplier.adapter.out.persistence.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import ru.florify.supplier.adapter.out.persistence.entity.PurchaseInvoiceJpaEntity;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

public interface PurchaseInvoiceJpaRepository extends JpaRepository<PurchaseInvoiceJpaEntity, UUID> {

    boolean existsBySupplierIdAndInvoiceNumber(UUID supplierId, String invoiceNumber);

    @Query("SELECT i FROM PurchaseInvoiceEntity i LEFT JOIN FETCH i.items WHERE i.id = :id")
    Optional<PurchaseInvoiceJpaEntity> findByIdWithItems(@Param("id") UUID id);

    @Query("""
           SELECT i FROM PurchaseInvoiceEntity i
           WHERE (:supplierId IS NULL OR i.supplierId = :supplierId)
           AND (:status IS NULL OR i.status = :status)
           AND (CAST(:from AS java.time.Instant) IS NULL OR i.createdAt >= :from)
           AND (CAST(:to AS java.time.Instant) IS NULL OR i.createdAt <= :to)
           ORDER BY i.createdAt DESC
           """)
    Page<PurchaseInvoiceJpaEntity> findAllWithFilters(
            @Param("supplierId") UUID supplierId,
            @Param("status") String status,
            @Param("from") Instant from,
            @Param("to") Instant to,
            Pageable pageable);
}
