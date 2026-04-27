package ru.florify.inventory.adapter.out.persistence.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import ru.florify.inventory.adapter.out.persistence.entity.StockTransactionJpaEntity;

import java.util.UUID;

public interface StockTransactionJpaRepository extends JpaRepository<StockTransactionJpaEntity, UUID> {
    boolean existsBySourceDocumentId(String sourceDocumentId);
    boolean existsBySourceDocumentIdAndProductId(String sourceDocumentId, UUID productId);
    Page<StockTransactionJpaEntity> findByProductIdOrderByCreatedAtDesc(UUID productId, Pageable pageable);
    Page<StockTransactionJpaEntity> findByTypeOrderByCreatedAtDesc(ru.florify.inventory.domain.model.TransactionType type, Pageable pageable);
}
