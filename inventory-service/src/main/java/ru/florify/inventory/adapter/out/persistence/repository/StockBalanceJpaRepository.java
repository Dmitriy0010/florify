package ru.florify.inventory.adapter.out.persistence.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import ru.florify.inventory.adapter.out.persistence.entity.StockBalanceJpaEntity;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface StockBalanceJpaRepository extends JpaRepository<StockBalanceJpaEntity, UUID> {
    Optional<StockBalanceJpaEntity> findByProductIdAndStoreId(UUID productId, UUID storeId);
    @Query("SELECT b FROM StockBalanceJpaEntity b JOIN ProductCatalogJpaEntity p ON b.productId = p.id " +
           "WHERE b.storeId = :storeId AND (:includeArchived = true OR p.active = true)")
    List<StockBalanceJpaEntity> findByStoreIdWithArchivedFilter(
            @org.springframework.data.repository.query.Param("storeId") UUID storeId, 
            @org.springframework.data.repository.query.Param("includeArchived") boolean includeArchived
    );

    @Query("SELECT b FROM StockBalanceJpaEntity b WHERE b.productId IN :productIds AND (:storeId IS NULL OR b.storeId = :storeId)")
    List<StockBalanceJpaEntity> findAllByProductIdInAndStoreId(
            @org.springframework.data.repository.query.Param("productIds") List<UUID> productIds, 
            @org.springframework.data.repository.query.Param("storeId") UUID storeId
    );
}
