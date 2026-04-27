package ru.florify.notification.application.port.in;

import ru.florify.common.application.query.PagedResult;
import ru.florify.notification.application.query.NotificationLogSearchQuery;
import ru.florify.notification.domain.model.NotificationLog;

import java.util.UUID;

public interface NotificationLogQueryUseCase {
    NotificationLog getById(UUID id);

    PagedResult<NotificationLog> search(NotificationLogSearchQuery query, int page, int size);
}

