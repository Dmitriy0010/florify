package ru.florify.media.domain.exception;

import ru.florify.common.exception.DomainException;

import java.util.UUID;

/**
 * Бросается при попытке взаимодействия с уже удалённым файлом.
 */
public class MediaFileDeletedException extends DomainException {
    public MediaFileDeletedException(UUID id) {
        super("MEDIA_FILE_ALREADY_DELETED", "Media file is already deleted: " + id);
    }
}
