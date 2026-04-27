package ru.florify.notification.application.port.out;

import ru.florify.notification.application.query.NotificationLogSearchQuery;
import ru.florify.notification.domain.model.NotificationLog;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface NotificationLogRepositoryPort {
    NotificationLog save(NotificationLog log);

    Optional<NotificationLog> findById(UUID id);

    List<NotificationLog> search(NotificationLogSearchQuery query, int page, int size);

    long count(NotificationLogSearchQuery query);
}

