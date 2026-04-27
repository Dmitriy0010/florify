package ru.florify.notification.application.port.out;

import ru.florify.notification.domain.model.Channel;
import ru.florify.notification.domain.model.NotificationTemplate;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface NotificationTemplateRepositoryPort {
    NotificationTemplate save(NotificationTemplate template);

    Optional<NotificationTemplate> findById(UUID id);

    Optional<NotificationTemplate> findByCodeAndChannel(String code, Channel channel);

    boolean existsByCodeAndChannel(String code, Channel channel);

    List<NotificationTemplate> findAll();
}

