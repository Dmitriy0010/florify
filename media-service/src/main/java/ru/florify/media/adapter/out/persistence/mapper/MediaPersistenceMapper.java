package ru.florify.media.adapter.out.persistence.mapper;

import org.mapstruct.*;
import ru.florify.media.adapter.out.persistence.entity.MediaFileJpaEntity;
import ru.florify.media.domain.model.MediaFile;

@Mapper(componentModel = "spring")
public interface MediaPersistenceMapper {

    MediaFile toDomain(MediaFileJpaEntity entity);

    MediaFileJpaEntity toEntity(MediaFile domain);
}
