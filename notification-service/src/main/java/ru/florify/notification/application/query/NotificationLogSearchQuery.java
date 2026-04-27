package ru.florify.notification.application.query;

import ru.florify.notification.domain.model.Channel;
import ru.florify.notification.domain.model.SendStatus;

import java.time.Instant;
import java.util.UUID;

public record NotificationLogSearchQuery(
        UUID recipientId,
        String templateCode,
        Channel channel,
        SendStatus status,
        Instant from,
        Instant to
) {
}

