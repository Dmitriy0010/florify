package ru.florify.media.adapter.in.web.mapper;

import java.time.Instant;
import java.util.UUID;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;
import ru.florify.media.adapter.in.web.dto.MediaUploadResponse;
import ru.florify.media.domain.model.MediaFile;
import ru.florify.media.domain.model.MediaFileStatus;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-05-05T13:18:51+0300",
    comments = "version: 1.6.3, compiler: Eclipse JDT (IDE) 3.45.0.v20260224-0835, environment: Java 21.0.10 (Eclipse Adoptium)"
)
@Component
public class MediaWebMapperImpl implements MediaWebMapper {

    @Override
    public MediaUploadResponse toResponse(MediaFile domain) {
        if ( domain == null ) {
            return null;
        }

        UUID id = null;
        String originalFilename = null;
        String mimeType = null;
        MediaFileStatus status = null;
        Instant uploadedAt = null;

        id = domain.getId();
        originalFilename = domain.getOriginalFilename();
        mimeType = domain.getMimeType();
        status = domain.getStatus();
        uploadedAt = domain.getUploadedAt();

        String url = null;

        MediaUploadResponse mediaUploadResponse = new MediaUploadResponse( id, originalFilename, mimeType, status, url, uploadedAt );

        return mediaUploadResponse;
    }
}
