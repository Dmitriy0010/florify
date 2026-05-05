package ru.florify.notification.adapter.in.web.mapper;

import java.time.Instant;
import java.util.UUID;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;
import ru.florify.notification.adapter.in.web.dto.NotificationLogResponse;
import ru.florify.notification.adapter.in.web.dto.NotificationTemplateResponse;
import ru.florify.notification.adapter.in.web.dto.UpsertTemplateRequest;
import ru.florify.notification.application.command.UpsertTemplateCommand;
import ru.florify.notification.domain.model.Channel;
import ru.florify.notification.domain.model.NotificationLog;
import ru.florify.notification.domain.model.NotificationTemplate;
import ru.florify.notification.domain.model.SendStatus;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-05-05T13:18:49+0300",
    comments = "version: 1.6.3, compiler: Eclipse JDT (IDE) 3.45.0.v20260224-0835, environment: Java 21.0.10 (Eclipse Adoptium)"
)
@Component
public class NotificationWebMapperImpl implements NotificationWebMapper {

    @Override
    public NotificationTemplateResponse toResponse(NotificationTemplate template) {
        if ( template == null ) {
            return null;
        }

        UUID id = null;
        String code = null;
        Channel channel = null;
        String subject = null;
        String bodyTemplate = null;

        id = template.getId();
        code = template.getCode();
        channel = template.getChannel();
        subject = template.getSubject();
        bodyTemplate = template.getBodyTemplate();

        boolean isActive = template.isActive();

        NotificationTemplateResponse notificationTemplateResponse = new NotificationTemplateResponse( id, code, channel, subject, bodyTemplate, isActive );

        return notificationTemplateResponse;
    }

    @Override
    public NotificationLogResponse toResponse(NotificationLog log) {
        if ( log == null ) {
            return null;
        }

        UUID id = null;
        UUID recipientId = null;
        String recipientContact = null;
        Channel channel = null;
        String templateCode = null;
        SendStatus status = null;
        Instant sentAt = null;
        String errorMessage = null;

        id = log.getId();
        recipientId = log.getRecipientId();
        recipientContact = log.getRecipientContact();
        channel = log.getChannel();
        templateCode = log.getTemplateCode();
        status = log.getStatus();
        sentAt = log.getSentAt();
        errorMessage = log.getErrorMessage();

        NotificationLogResponse notificationLogResponse = new NotificationLogResponse( id, recipientId, recipientContact, channel, templateCode, status, sentAt, errorMessage );

        return notificationLogResponse;
    }

    @Override
    public UpsertTemplateCommand toCommand(UUID id, UpsertTemplateRequest request) {
        if ( id == null && request == null ) {
            return null;
        }

        String code = null;
        Channel channel = null;
        String subject = null;
        String bodyTemplate = null;
        boolean isActive = false;
        if ( request != null ) {
            code = request.code();
            channel = request.channel();
            subject = request.subject();
            bodyTemplate = request.bodyTemplate();
            isActive = request.isActive();
        }
        UUID id1 = null;
        id1 = id;

        UpsertTemplateCommand upsertTemplateCommand = new UpsertTemplateCommand( id1, code, channel, subject, bodyTemplate, isActive );

        return upsertTemplateCommand;
    }
}
