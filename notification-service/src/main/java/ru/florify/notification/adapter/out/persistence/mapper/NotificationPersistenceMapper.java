package ru.florify.notification.adapter.out.persistence.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import ru.florify.notification.adapter.out.persistence.entity.NotificationLogJpaEntity;
import ru.florify.notification.adapter.out.persistence.entity.NotificationTemplateJpaEntity;
import ru.florify.notification.domain.model.NotificationLog;
import ru.florify.notification.domain.model.NotificationTemplate;

@Mapper(componentModel = "spring")
public interface NotificationPersistenceMapper {
    @Mapping(target = "isActive", expression = "java(template.isActive())")
    NotificationTemplateJpaEntity toJpaEntity(NotificationTemplate template);

    @Mapping(target = "isActive", expression = "java(entity.isActive())")
    NotificationTemplate toDomain(NotificationTemplateJpaEntity entity);

    NotificationLogJpaEntity toJpaEntity(NotificationLog log);
    NotificationLog toDomain(NotificationLogJpaEntity entity);
}

