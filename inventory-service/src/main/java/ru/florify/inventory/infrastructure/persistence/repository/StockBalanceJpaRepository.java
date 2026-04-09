package ru.florify.inventory.infrastructure.persistence.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import ru.florify.inventory.infrastructure.persistence.entity.StockBalanceJpaEntity;

import java.util.Optional;
import java.util.UUID;

public interface StockBalanceJpaRepository extends JpaRepository<StockBalanceJpaEntity, UUID> {
    Optional<StockBalanceJpaEntity> findByProductId(UUID productId);
}
