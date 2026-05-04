package ru.florify.notification.adapter.in.web.dto;

import ru.florify.notification.domain.model.Channel;

import java.util.List;
import java.util.Map;
import java.util.UUID;

public record SendBlastRequest(
        List<UUID> recipientIds,
        Channel channel,
        String templateCode,
        String customSubject,
        String customBody,
        Map<String, Object> variables
) {
}
