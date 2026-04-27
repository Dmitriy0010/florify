package ru.florify.notification.adapter.in.web.dto;

import ru.florify.notification.domain.model.Channel;

import java.util.UUID;

public record NotificationTemplateResponse(
        UUID id,
        String code,
        Channel channel,
        String subject,
        String bodyTemplate,
        boolean isActive
) {
}

