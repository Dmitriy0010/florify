package ru.florify.notification.application.port.in;

import ru.florify.notification.application.command.UpsertTemplateCommand;
import ru.florify.notification.domain.model.Channel;
import ru.florify.notification.domain.model.NotificationTemplate;

import java.util.List;
import java.util.UUID;

public interface NotificationTemplateUseCase {

    NotificationTemplate upsert(UpsertTemplateCommand command);

    NotificationTemplate getById(UUID id);

    NotificationTemplate getByCodeAndChannel(String code, Channel channel);

    List<NotificationTemplate> list();

    NotificationTemplate activate(UUID id);

    NotificationTemplate deactivate(UUID id);
}

