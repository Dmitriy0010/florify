package ru.florify.notification.application.command;

import ru.florify.notification.domain.model.Channel;

import java.util.List;
import java.util.Map;
import java.util.UUID;

public record SendBlastCommand(
        List<UUID> recipientIds,
        Channel channel,
        String templateCode,
        String customSubject,
        String customBody,
        Map<String, Object> variables
) {
}
