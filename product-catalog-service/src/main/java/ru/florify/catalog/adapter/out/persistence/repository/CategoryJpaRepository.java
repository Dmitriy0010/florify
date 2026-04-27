package ru.florify.catalog.adapter.out.persistence.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ru.florify.catalog.adapter.out.persistence.entity.ProductCategoryJpaEntity;

import java.util.List;
import java.util.UUID;

@Repository
public interface CategoryJpaRepository extends JpaRepository<ProductCategoryJpaEntity, UUID> {
    List<ProductCategoryJpaEntity> findByActiveTrue();
}
