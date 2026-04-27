package ru.florify.notification.adapter.out.persistence.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;
import ru.florify.notification.adapter.out.persistence.entity.NotificationLogJpaEntity;

import java.util.UUID;

@Repository
public interface NotificationLogJpaRepository extends JpaRepository<NotificationLogJpaEntity, UUID>, JpaSpecificationExecutor<NotificationLogJpaEntity> {
    Page<NotificationLogJpaEntity> findByRecipientId(UUID recipientId, Pageable pageable);
}

