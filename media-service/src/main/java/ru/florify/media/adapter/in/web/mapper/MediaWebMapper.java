package ru.florify.media.adapter.in.web.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import ru.florify.media.adapter.in.web.dto.MediaUploadResponse;
import ru.florify.media.domain.model.MediaFile;

@Mapper(componentModel = "spring")
public interface MediaWebMapper {

    @Mapping(target = "url", ignore = true)
    MediaUploadResponse toResponse(MediaFile domain);
}
