package ru.florify.notification.application.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import ru.florify.notification.application.command.UpsertTemplateCommand;
import ru.florify.notification.application.port.in.NotificationTemplateUseCase;
import ru.florify.notification.application.port.out.NotificationTemplateRepositoryPort;
import ru.florify.notification.domain.exception.NotificationTemplateNotFoundException;
import ru.florify.notification.domain.model.Channel;
import ru.florify.notification.domain.model.NotificationTemplate;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class NotificationTemplateInteractor implements NotificationTemplateUseCase {

    private final NotificationTemplateRepositoryPort repository;

    @Override
    public NotificationTemplate upsert(UpsertTemplateCommand command) {
        // Try to find existing template by unique business key (code + channel)
        UUID existingId = command.id();
        if (existingId == null) {
            existingId = repository.findByCodeAndChannel(command.code(), command.channel())
                    .map(NotificationTemplate::getId)
                    .orElse(null);
        }

        NotificationTemplate template = NotificationTemplate.builder()
                .id(existingId)
                .code(command.code())
                .channel(command.channel())
                .subject(command.subject())
                .bodyTemplate(command.bodyTemplate())
                .isActive(command.isActive())
                .build();

        template.validateInvariants();
        return repository.save(template);
    }

    @Override
    public NotificationTemplate getById(UUID id) {
        return repository.findById(id).orElseThrow(() -> new NotificationTemplateNotFoundException(id.toString()));
    }

    @Override
    public NotificationTemplate getByCodeAndChannel(String code, Channel channel) {
        return repository.findByCodeAndChannel(code, channel)
                .orElseThrow(() -> new NotificationTemplateNotFoundException(code));
    }

    @Override
    public List<NotificationTemplate> list() {
        return repository.findAll();
    }

    @Override
    public NotificationTemplate activate(UUID id) {
        NotificationTemplate template = getById(id);
        return repository.save(template.activate());
    }

    @Override
    public NotificationTemplate deactivate(UUID id) {
        NotificationTemplate template = getById(id);
        return repository.save(template.deactivate());
    }
}

