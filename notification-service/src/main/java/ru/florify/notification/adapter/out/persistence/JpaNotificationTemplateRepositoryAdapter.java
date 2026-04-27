package ru.florify.notification.adapter.out.persistence;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import ru.florify.notification.adapter.out.persistence.mapper.NotificationPersistenceMapper;
import ru.florify.notification.adapter.out.persistence.repository.NotificationTemplateJpaRepository;
import ru.florify.notification.application.port.out.NotificationTemplateRepositoryPort;
import ru.florify.notification.domain.model.Channel;
import ru.florify.notification.domain.model.NotificationTemplate;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class JpaNotificationTemplateRepositoryAdapter implements NotificationTemplateRepositoryPort {

    private final NotificationTemplateJpaRepository repository;
    private final NotificationPersistenceMapper mapper;

    @Override
    public NotificationTemplate save(NotificationTemplate template) {
        template.validateInvariants();
        if (template.getId() == null) {
            template = template.toBuilder().id(UUID.randomUUID()).build();
        }
        return mapper.toDomain(repository.save(mapper.toJpaEntity(template)));
    }

    @Override
    public Optional<NotificationTemplate> findByCodeAndChannel(String code, Channel channel) {
        return repository.findByCodeAndChannel(code, channel).map(mapper::toDomain);
    }

    @Override
    public boolean existsByCodeAndChannel(String code, Channel channel) {
        return repository.existsByCodeAndChannel(code, channel);
    }

    @Override
    public Optional<NotificationTemplate> findById(UUID id) {
        return repository.findById(id).map(mapper::toDomain);
    }

    @Override
    public List<NotificationTemplate> findAll() {
        return repository.findAll().stream().map(mapper::toDomain).toList();
    }
}

