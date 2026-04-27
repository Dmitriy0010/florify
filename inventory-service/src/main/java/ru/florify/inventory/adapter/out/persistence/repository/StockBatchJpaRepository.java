package ru.florify.inventory.adapter.out.persistence.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import ru.florify.inventory.adapter.out.persistence.entity.StockBatchJpaEntity;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public interface StockBatchJpaRepository extends JpaRepository<StockBatchJpaEntity, UUID> {

    @Query("SELECT b FROM StockBatchJpaEntity b " +
           "WHERE b.productId = :productId AND b.storeId = :storeId AND b.status = 'AVAILABLE' " +
           "ORDER BY b.receivedAt ASC")
    List<StockBatchJpaEntity> findAvailableByProductIdAndStoreIdOrderByReceivedAtAsc(
            @Param("productId") UUID productId,
            @Param("storeId") UUID storeId
    );

    @Query("SELECT b FROM StockBatchJpaEntity b " +
           "WHERE b.expiresAt IS NOT NULL AND b.expiresAt < :now AND b.status = 'AVAILABLE'")
    List<StockBatchJpaEntity> findExpiredBatches(@Param("now") Instant now);

    List<StockBatchJpaEntity> findByProductIdOrderByReceivedAtDesc(UUID productId);
}
