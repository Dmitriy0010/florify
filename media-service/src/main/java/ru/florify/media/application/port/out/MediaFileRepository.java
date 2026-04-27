package ru.florify.media.application.port.out;

import ru.florify.media.domain.model.MediaFile;
import java.util.Optional;
import java.util.UUID;

public interface MediaFileRepository {
    MediaFile save(MediaFile mediaFile);
    Optional<MediaFile> findById(UUID id);
    MediaFile findByIdOrThrow(UUID id);
}
