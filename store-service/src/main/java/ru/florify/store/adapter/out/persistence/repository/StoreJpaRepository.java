package ru.florify.store.adapter.out.persistence.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import ru.florify.store.adapter.out.persistence.entity.StoreJpaEntity;
import java.util.UUID;

public interface StoreJpaRepository extends JpaRepository<StoreJpaEntity, UUID> {
}
