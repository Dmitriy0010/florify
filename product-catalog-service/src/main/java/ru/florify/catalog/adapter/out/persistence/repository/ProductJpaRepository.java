package ru.florify.catalog.adapter.out.persistence.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;
import ru.florify.catalog.adapter.out.persistence.entity.ProductJpaEntity;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProductJpaRepository extends JpaRepository<ProductJpaEntity, UUID>, JpaSpecificationExecutor<ProductJpaEntity> {
    Optional<ProductJpaEntity> findBySku(String sku);
    boolean existsBySku(String sku);
    List<ProductJpaEntity> findByCategoryId(UUID categoryId);
}
