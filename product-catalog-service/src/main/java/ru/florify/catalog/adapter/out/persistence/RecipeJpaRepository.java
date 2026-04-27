package ru.florify.catalog.adapter.out.persistence;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;

public interface RecipeJpaRepository extends JpaRepository<RecipeJpaEntity, UUID> {
    Optional<RecipeJpaEntity> findByProductId(UUID productId);
}
