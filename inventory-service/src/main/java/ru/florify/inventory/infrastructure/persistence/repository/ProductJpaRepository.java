package ru.florify.inventory.infrastructure.persistence.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import ru.florify.inventory.infrastructure.persistence.entity.ProductJpaEntity;

import java.util.Optional;
import java.util.UUID;

public interface ProductJpaRepository extends JpaRepository<ProductJpaEntity, UUID> {
    Optional<ProductJpaEntity> findByIdAndActiveTrue(UUID id);
    Page<ProductJpaEntity> findAllByActiveTrue(Pageable pageable);
    Optional<ProductJpaEntity> findBySku(String sku);
}
