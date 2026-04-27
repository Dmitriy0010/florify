package ru.florify.notification.adapter.in.web.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import ru.florify.notification.adapter.in.web.dto.NotificationLogResponse;
import ru.florify.notification.adapter.in.web.dto.NotificationTemplateResponse;
import ru.florify.notification.adapter.in.web.dto.UpsertTemplateRequest;
import ru.florify.notification.application.command.UpsertTemplateCommand;
import ru.florify.notification.domain.model.NotificationLog;
import ru.florify.notification.domain.model.NotificationTemplate;

import java.util.UUID;

@Mapper(componentModel = "spring")
public interface NotificationWebMapper {

    @Mapping(target = "isActive", expression = "java(template.isActive())")
    NotificationTemplateResponse toResponse(NotificationTemplate template);

    NotificationLogResponse toResponse(NotificationLog log);

    @Mapping(target = "id", source = "id")
    UpsertTemplateCommand toCommand(UUID id, UpsertTemplateRequest request);

    default UpsertTemplateCommand toCommand(UpsertTemplateRequest request) {
        return toCommand(null, request);
    }
}

