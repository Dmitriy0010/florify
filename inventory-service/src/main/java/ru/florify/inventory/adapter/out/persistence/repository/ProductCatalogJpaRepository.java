package ru.florify.inventory.adapter.out.persistence.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import ru.florify.inventory.adapter.out.persistence.entity.ProductCatalogJpaEntity;

import java.util.UUID;

public interface ProductCatalogJpaRepository extends JpaRepository<ProductCatalogJpaEntity, UUID> {
}
