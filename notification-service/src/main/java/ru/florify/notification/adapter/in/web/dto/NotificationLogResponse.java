package ru.florify.notification.adapter.in.web.dto;

import ru.florify.notification.domain.model.Channel;
import ru.florify.notification.domain.model.SendStatus;

import java.time.Instant;
import java.util.UUID;

public record NotificationLogResponse(
        UUID id,
        UUID recipientId,
        String recipientContact,
        Channel channel,
        String templateCode,
        SendStatus status,
        Instant sentAt,
        String errorMessage
) {
}

