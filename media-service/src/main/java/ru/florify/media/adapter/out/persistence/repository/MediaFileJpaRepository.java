package ru.florify.media.adapter.out.persistence.repository;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import ru.florify.media.adapter.out.persistence.entity.MediaFileJpaEntity;

import java.util.Optional;
import java.util.UUID;

public interface MediaFileJpaRepository extends JpaRepository<MediaFileJpaEntity, UUID> {
    
    @Override
    Optional<MediaFileJpaEntity> findById(UUID id);
}
