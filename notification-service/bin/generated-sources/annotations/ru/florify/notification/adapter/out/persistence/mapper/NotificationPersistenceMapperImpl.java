package ru.florify.notification.adapter.out.persistence.mapper;

import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;
import ru.florify.notification.adapter.out.persistence.entity.NotificationLogJpaEntity;
import ru.florify.notification.adapter.out.persistence.entity.NotificationTemplateJpaEntity;
import ru.florify.notification.domain.model.NotificationLog;
import ru.florify.notification.domain.model.NotificationTemplate;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-05-05T13:18:49+0300",
    comments = "version: 1.6.3, compiler: Eclipse JDT (IDE) 3.45.0.v20260224-0835, environment: Java 21.0.10 (Eclipse Adoptium)"
)
@Component
public class NotificationPersistenceMapperImpl implements NotificationPersistenceMapper {

    @Override
    public NotificationTemplateJpaEntity toJpaEntity(NotificationTemplate template) {
        if ( template == null ) {
            return null;
        }

        NotificationTemplateJpaEntity.NotificationTemplateJpaEntityBuilder notificationTemplateJpaEntity = NotificationTemplateJpaEntity.builder();

        notificationTemplateJpaEntity.bodyTemplate( template.getBodyTemplate() );
        notificationTemplateJpaEntity.channel( template.getChannel() );
        notificationTemplateJpaEntity.code( template.getCode() );
        notificationTemplateJpaEntity.id( template.getId() );
        notificationTemplateJpaEntity.subject( template.getSubject() );

        notificationTemplateJpaEntity.isActive( template.isActive() );

        return notificationTemplateJpaEntity.build();
    }

    @Override
    public NotificationTemplate toDomain(NotificationTemplateJpaEntity entity) {
        if ( entity == null ) {
            return null;
        }

        NotificationTemplate.NotificationTemplateBuilder notificationTemplate = NotificationTemplate.builder();

        notificationTemplate.bodyTemplate( entity.getBodyTemplate() );
        notificationTemplate.channel( entity.getChannel() );
        notificationTemplate.code( entity.getCode() );
        notificationTemplate.id( entity.getId() );
        notificationTemplate.subject( entity.getSubject() );

        notificationTemplate.isActive( entity.isActive() );

        return notificationTemplate.build();
    }

    @Override
    public NotificationLogJpaEntity toJpaEntity(NotificationLog log) {
        if ( log == null ) {
            return null;
        }

        NotificationLogJpaEntity.NotificationLogJpaEntityBuilder notificationLogJpaEntity = NotificationLogJpaEntity.builder();

        notificationLogJpaEntity.channel( log.getChannel() );
        notificationLogJpaEntity.errorMessage( log.getErrorMessage() );
        notificationLogJpaEntity.id( log.getId() );
        notificationLogJpaEntity.recipientContact( log.getRecipientContact() );
        notificationLogJpaEntity.recipientId( log.getRecipientId() );
        notificationLogJpaEntity.sentAt( log.getSentAt() );
        notificationLogJpaEntity.status( log.getStatus() );
        notificationLogJpaEntity.templateCode( log.getTemplateCode() );

        return notificationLogJpaEntity.build();
    }

    @Override
    public NotificationLog toDomain(NotificationLogJpaEntity entity) {
        if ( entity == null ) {
            return null;
        }

        NotificationLog.NotificationLogBuilder notificationLog = NotificationLog.builder();

        notificationLog.channel( entity.getChannel() );
        notificationLog.errorMessage( entity.getErrorMessage() );
        notificationLog.id( entity.getId() );
        notificationLog.recipientContact( entity.getRecipientContact() );
        notificationLog.recipientId( entity.getRecipientId() );
        notificationLog.sentAt( entity.getSentAt() );
        notificationLog.status( entity.getStatus() );
        notificationLog.templateCode( entity.getTemplateCode() );

        return notificationLog.build();
    }
}
