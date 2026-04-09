package ru.florify.inventory.infrastructure.persistence.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import ru.florify.inventory.infrastructure.persistence.entity.StockTransactionJpaEntity;

import java.util.UUID;

public interface StockTransactionJpaRepository extends JpaRepository<StockTransactionJpaEntity, UUID> {
    boolean existsBySourceDocumentId(String sourceDocumentId);
}
