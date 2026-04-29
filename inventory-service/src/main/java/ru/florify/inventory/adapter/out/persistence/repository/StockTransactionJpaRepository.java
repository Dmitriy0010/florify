package ru.florify.inventory.adapter.out.persistence.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import ru.florify.inventory.adapter.out.persistence.entity.StockTransactionJpaEntity;

import java.util.UUID;

public interface StockTransactionJpaRepository extends JpaRepository<StockTransactionJpaEntity, UUID> {
    boolean existsBySourceDocumentId(String sourceDocumentId);
    boolean existsBySourceDocumentIdAndProductId(String sourceDocumentId, UUID productId);
    Page<StockTransactionJpaEntity> findByProductIdOrderByCreatedAtDesc(UUID productId, Pageable pageable);
    @Query("SELECT s FROM StockTransactionJpaEntity s " +
           "WHERE s.type = :type AND (s.writeOffReason IS NULL OR s.writeOffReason != :reason) " +
           "ORDER BY s.createdAt DESC")
    Page<StockTransactionJpaEntity> findByTypeAndWriteOffReasonNot(
        @Param("type") ru.florify.inventory.domain.model.TransactionType type, 
        @Param("reason") ru.florify.inventory.domain.model.WriteOffReason reason, 
        Pageable pageable
    );
}
