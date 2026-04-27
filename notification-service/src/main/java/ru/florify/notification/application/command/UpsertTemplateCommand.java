package ru.florify.notification.application.command;

import ru.florify.notification.domain.model.Channel;

import java.util.UUID;

public record UpsertTemplateCommand(
        UUID id,
        String code,
        Channel channel,
        String subject,
        String bodyTemplate,
        boolean isActive
) {
}

