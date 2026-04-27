package ru.florify.notification.adapter.out.persistence;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import ru.florify.notification.adapter.out.persistence.mapper.NotificationPersistenceMapper;
import ru.florify.notification.adapter.out.persistence.repository.NotificationLogJpaRepository;
import ru.florify.notification.application.port.out.NotificationLogRepositoryPort;
import ru.florify.notification.application.query.NotificationLogSearchQuery;
import ru.florify.notification.domain.model.NotificationLog;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class JpaNotificationLogRepositoryAdapter implements NotificationLogRepositoryPort {

    private final NotificationLogJpaRepository repository;
    private final NotificationPersistenceMapper mapper;

    @Override
    public NotificationLog save(NotificationLog log) {
        if (log.getId() == null) {
            log = log.toBuilder().id(UUID.randomUUID()).build();
        }
        return mapper.toDomain(repository.save(mapper.toJpaEntity(log)));
    }

    @Override
    public Optional<NotificationLog> findById(UUID id) {
        return repository.findById(id).map(mapper::toDomain);
    }

    @Override
    public List<NotificationLog> search(NotificationLogSearchQuery query, int page, int size) {
        return repository.findAll(NotificationLogSpecifications.fromQuery(query),
                        org.springframework.data.domain.PageRequest.of(page, size))
                .map(mapper::toDomain)
                .toList();
    }

    @Override
    public long count(NotificationLogSearchQuery query) {
        return repository.count(NotificationLogSpecifications.fromQuery(query));
    }
}

