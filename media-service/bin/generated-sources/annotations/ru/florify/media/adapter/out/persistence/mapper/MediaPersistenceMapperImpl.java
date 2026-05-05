package ru.florify.media.adapter.out.persistence.mapper;

import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;
import ru.florify.media.adapter.out.persistence.entity.MediaFileJpaEntity;
import ru.florify.media.domain.model.MediaFile;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-05-05T13:18:51+0300",
    comments = "version: 1.6.3, compiler: Eclipse JDT (IDE) 3.45.0.v20260224-0835, environment: Java 21.0.10 (Eclipse Adoptium)"
)
@Component
public class MediaPersistenceMapperImpl implements MediaPersistenceMapper {

    @Override
    public MediaFile toDomain(MediaFileJpaEntity entity) {
        if ( entity == null ) {
            return null;
        }

        MediaFile.MediaFileBuilder mediaFile = MediaFile.builder();

        mediaFile.basePath( entity.getBasePath() );
        mediaFile.bucket( entity.getBucket() );
        mediaFile.id( entity.getId() );
        mediaFile.mimeType( entity.getMimeType() );
        mediaFile.originalFilename( entity.getOriginalFilename() );
        mediaFile.status( entity.getStatus() );
        mediaFile.uploadedAt( entity.getUploadedAt() );
        mediaFile.uploadedBy( entity.getUploadedBy() );

        return mediaFile.build();
    }

    @Override
    public MediaFileJpaEntity toEntity(MediaFile domain) {
        if ( domain == null ) {
            return null;
        }

        MediaFileJpaEntity.MediaFileJpaEntityBuilder mediaFileJpaEntity = MediaFileJpaEntity.builder();

        mediaFileJpaEntity.basePath( domain.getBasePath() );
        mediaFileJpaEntity.bucket( domain.getBucket() );
        mediaFileJpaEntity.id( domain.getId() );
        mediaFileJpaEntity.mimeType( domain.getMimeType() );
        mediaFileJpaEntity.originalFilename( domain.getOriginalFilename() );
        mediaFileJpaEntity.status( domain.getStatus() );
        mediaFileJpaEntity.uploadedAt( domain.getUploadedAt() );
        mediaFileJpaEntity.uploadedBy( domain.getUploadedBy() );

        return mediaFileJpaEntity.build();
    }
}
