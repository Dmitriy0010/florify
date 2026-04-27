package ru.florify.notification.adapter.in.web.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import ru.florify.notification.domain.model.Channel;

public record UpsertTemplateRequest(
        @NotBlank String code,
        @NotNull Channel channel,
        String subject,
        @NotBlank String bodyTemplate,
        boolean isActive
) {
}

