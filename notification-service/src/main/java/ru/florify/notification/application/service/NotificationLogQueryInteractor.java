package ru.florify.notification.application.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import ru.florify.common.application.query.PagedResult;
import ru.florify.common.exception.NotFoundException;
import ru.florify.notification.application.port.in.NotificationLogQueryUseCase;
import ru.florify.notification.application.port.out.NotificationLogRepositoryPort;
import ru.florify.notification.application.query.NotificationLogSearchQuery;
import ru.florify.notification.domain.model.NotificationLog;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class NotificationLogQueryInteractor implements NotificationLogQueryUseCase {

    private final NotificationLogRepositoryPort repository;

    @Override
    public NotificationLog getById(UUID id) {
        return repository.findById(id)
                .orElseThrow(() -> new NotFoundException("Notification log", id));
    }

    @Override
    public PagedResult<NotificationLog> search(NotificationLogSearchQuery query, int page, int size) {
        var data = repository.search(query, page, size);
        long total = repository.count(query);
        return new PagedResult<>(data, page, size, total);
    }
}

