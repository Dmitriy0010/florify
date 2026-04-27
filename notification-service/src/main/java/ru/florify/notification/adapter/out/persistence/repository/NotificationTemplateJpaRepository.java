package ru.florify.notification.adapter.out.persistence.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ru.florify.notification.adapter.out.persistence.entity.NotificationTemplateJpaEntity;
import ru.florify.notification.domain.model.Channel;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface NotificationTemplateJpaRepository extends JpaRepository<NotificationTemplateJpaEntity, UUID> {
    Optional<NotificationTemplateJpaEntity> findByCodeAndChannel(String code, Channel channel);
    boolean existsByCodeAndChannel(String code, Channel channel);
}

