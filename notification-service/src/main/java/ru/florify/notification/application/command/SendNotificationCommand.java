package ru.florify.notification.application.command;

import ru.florify.notification.domain.model.Channel;

import java.util.Map;
import java.util.UUID;

public record SendNotificationCommand(
        String templateCode,
        Channel channel,
        UUID recipientId,
        Map<String, Object> variables,
        String correlationId
) {
}

